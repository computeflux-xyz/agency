/**
 * WebGL renderer: one context, two tiny programs:
 *   1. a textured quad for the dragon (samples the pre-baked sprite atlas)
 *   2. point-sprites for fire particles (soft radial, warm plume)
 *
 * Everything is expressed in CSS-pixel / viewport coordinates (y-down, origin
 * top-left — the same space as getBoundingClientRect) and converted to clip
 * space in the vertex shaders, so the behaviour code never thinks about GL.
 *
 * Compositing model: PREMULTIPLIED-alpha "over" (blendFunc(ONE,
 * ONE_MINUS_SRC_ALPHA)) throughout:
 *   - Additive blending was rejected: it washes out to white over the site's
 *     near-white paper (#f5f4ef). Saturated amber/ember/red over-compositing
 *     reads as real flame on a light background.
 *   - Premultiplied atlas upload avoids the dark 1px halo that straight-alpha
 *     leaves around anti-aliased sprite edges on light paper.
 *   - No white-hot peak (photosensitivity): the "core" only nudges warm.
 *
 * Point-sprites (not instanced quads) keep the particle path identical on
 * WebGL1 and WebGL2 with no extension juggling.
 */
import { type Atlas } from "./sprite";
import { CONFIG } from "./config";

const SPRITE_VS = `
attribute vec2 a_corner;
attribute vec2 a_uv;
uniform vec2 u_res;
uniform vec2 u_center;
uniform vec2 u_size;
uniform float u_rot;
uniform vec2 u_uvOffset;
uniform vec2 u_uvScale;
varying vec2 v_uv;
void main() {
  vec2 p = a_corner * u_size;
  float c = cos(u_rot), s = sin(u_rot);
  p = vec2(p.x * c - p.y * s, p.x * s + p.y * c) + u_center;
  vec2 clip = vec2(p.x / u_res.x * 2.0 - 1.0, 1.0 - p.y / u_res.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
  v_uv = u_uvOffset + a_uv * u_uvScale;
}`;

// Atlas texels are premultiplied. Scale premultiplied rgb+a by u_alpha.
const SPRITE_FS = `
precision mediump float;
uniform sampler2D u_tex;
uniform float u_alpha;
varying vec2 v_uv;
void main() {
  vec4 t = texture2D(u_tex, v_uv);
  gl_FragColor = t * u_alpha;
}`;

const PARTICLE_VS = `
attribute vec2 a_pos;
attribute float a_size;
attribute vec4 a_color;
uniform vec2 u_res;
uniform float u_dpr;
varying vec4 v_color;
void main() {
  vec2 clip = vec2(a_pos.x / u_res.x * 2.0 - 1.0, 1.0 - a_pos.y / u_res.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = max(a_size * u_dpr, 1.0);
  v_color = a_color;
}`;

// Soft radial falloff + a gentle WARM (never white) core, output premultiplied.
const PARTICLE_FS = `
precision mediump float;
varying vec4 v_color;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d) * 2.0;
  if (r > 1.0) discard;
  float body = smoothstep(1.0, 0.12, r);
  float core = smoothstep(0.5, 0.0, r);
  vec3 col = v_color.rgb + core * 0.18 * vec3(1.0, 0.82, 0.42);
  float a = v_color.a * body;
  gl_FragColor = vec4(col * a, a);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("dragon shader: " + log);
  }

  return sh;
}

function link(gl: WebGLRenderingContext, vs: string, fs: string): WebGLProgram {
  const p = gl.createProgram()!;
  const v = compile(gl, gl.VERTEX_SHADER, vs);
  const f = compile(gl, gl.FRAGMENT_SHADER, fs);
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error("dragon program: " + gl.getProgramInfoLog(p));
  }

  return p;
}

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private atlas: Atlas;
  private tex!: WebGLTexture;

  private spriteProg!: WebGLProgram;
  private spriteBuf!: WebGLBuffer;
  private sLoc!: Record<string, WebGLUniformLocation | null>;
  private sAttr!: { corner: number; uv: number };

  private partProg!: WebGLProgram;
  private partBuf!: WebGLBuffer;
  private partBytes = 0;
  private pLoc!: Record<string, WebGLUniformLocation | null>;
  private pAttr!: { pos: number; size: number; color: number };

  private dpr = 1;
  cssW = 0;
  cssH = 0;
  lost = false;

  constructor(canvas: HTMLCanvasElement, atlas: Atlas) {
    this.canvas = canvas;
    this.atlas = atlas;
    const opts: WebGLContextAttributes = {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    };
    const gl = (canvas.getContext("webgl2", opts) || canvas.getContext("webgl", opts)) as WebGLRenderingContext | null;
    if (!gl) throw new Error("WebGL unavailable");
    this.gl = gl;
    canvas.addEventListener("webglcontextlost", this.onLost, false);
    canvas.addEventListener("webglcontextrestored", this.onRestored, false);
    this.build();
  }

  private onLost = (e: Event) => {
    e.preventDefault(); // required, else the context is never restorable
    this.lost = true;
  };

  private onRestored = () => {
    this.build();
    this.resize(this.cssW, this.cssH, this.dpr);
    this.lost = false;
  };

  /** Idempotent GL resource creation, shared by first init and context restore. */
  private build(): void {
    const gl = this.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied "over"

    this.spriteProg = link(gl, SPRITE_VS, SPRITE_FS);
    // prettier-ignore
    const quad = new Float32Array([
      -0.5,-0.5, 0,0,   0.5,-0.5, 1,0,   0.5,0.5, 1,1,
      -0.5,-0.5, 0,0,   0.5,0.5, 1,1,   -0.5,0.5, 0,1,
    ]);
    this.spriteBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.spriteBuf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    this.sAttr = {
      corner: gl.getAttribLocation(this.spriteProg, "a_corner"),
      uv: gl.getAttribLocation(this.spriteProg, "a_uv"),
    };
    this.sLoc = {};
    for (const u of ["u_res", "u_center", "u_size", "u_rot", "u_uvOffset", "u_uvScale", "u_tex", "u_alpha"])
      this.sLoc[u] = gl.getUniformLocation(this.spriteProg, u);

    this.partProg = link(gl, PARTICLE_VS, PARTICLE_FS);
    this.partBuf = gl.createBuffer()!;
    // Pre-size the dynamic buffer once, per-frame uploads use bufferSubData.
    this.partBytes = CONFIG.fire.maxParticles * 7 * 4;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.partBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.partBytes, gl.DYNAMIC_DRAW);
    this.pAttr = {
      pos: gl.getAttribLocation(this.partProg, "a_pos"),
      size: gl.getAttribLocation(this.partProg, "a_size"),
      color: gl.getAttribLocation(this.partProg, "a_color"),
    };
    this.pLoc = {};
    for (const u of ["u_res", "u_dpr"]) this.pLoc[u] = gl.getUniformLocation(this.partProg, u);

    this.tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.atlas.canvas as TexImageSource);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  resize(cssW: number, cssH: number, dpr: number): void {
    this.cssW = cssW;
    this.cssH = cssH;
    this.dpr = dpr;
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;
    this.canvas.style.width = cssW + "px";
    this.canvas.style.height = cssH + "px";
    if (!this.lost) this.gl.viewport(0, 0, w, h);
  }

  beginFrame(): void {
    if (this.lost) return;
    const gl = this.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  /** Draw the dragon: cell (col,row) of the atlas at (x,y), given draw size. */
  drawSprite(
    col: number,
    row: number,
    x: number,
    y: number,
    size: number,
    rot: number,
    flipX: boolean,
    alpha: number,
  ): void {
    if (this.lost || alpha <= 0.001) return;
    const gl = this.gl;
    gl.useProgram(this.spriteProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.spriteBuf);
    gl.enableVertexAttribArray(this.sAttr.corner);
    gl.vertexAttribPointer(this.sAttr.corner, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(this.sAttr.uv);
    gl.vertexAttribPointer(this.sAttr.uv, 2, gl.FLOAT, false, 16, 8);

    gl.uniform2f(this.sLoc.u_res!, this.cssW, this.cssH);
    gl.uniform2f(this.sLoc.u_center!, x, y);
    gl.uniform2f(this.sLoc.u_size!, flipX ? -size : size, size);
    gl.uniform1f(this.sLoc.u_rot!, rot);
    gl.uniform2f(this.sLoc.u_uvOffset!, col / this.atlas.cols, row / this.atlas.rows);
    gl.uniform2f(this.sLoc.u_uvScale!, 1 / this.atlas.cols, 1 / this.atlas.rows);
    gl.uniform1f(this.sLoc.u_alpha!, alpha);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.uniform1i(this.sLoc.u_tex!, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /**
   * Draw `count` particles from an interleaved SoA view:
   * [x, y, size, r, g, b, a] per particle (7 floats, straight-alpha colours;
   * the shader premultiplies). Uploaded via bufferSubData (no realloc).
   */
  drawParticles(data: Float32Array, count: number): void {
    if (this.lost || count === 0) return;
    const gl = this.gl;
    gl.useProgram(this.partProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.partBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.subarray(0, count * 7));
    const stride = 28;
    gl.enableVertexAttribArray(this.pAttr.pos);
    gl.vertexAttribPointer(this.pAttr.pos, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(this.pAttr.size);
    gl.vertexAttribPointer(this.pAttr.size, 1, gl.FLOAT, false, stride, 8);
    gl.enableVertexAttribArray(this.pAttr.color);
    gl.vertexAttribPointer(this.pAttr.color, 4, gl.FLOAT, false, stride, 12);

    gl.uniform2f(this.pLoc.u_res!, this.cssW, this.cssH);
    gl.uniform1f(this.pLoc.u_dpr!, this.dpr);
    gl.drawArrays(gl.POINTS, 0, count);
  }

  destroy(): void {
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onRestored);
    const gl = this.gl;
    try {
      gl.deleteBuffer(this.spriteBuf);
      gl.deleteBuffer(this.partBuf);
      gl.deleteTexture(this.tex);
      gl.deleteProgram(this.spriteProg);
      gl.deleteProgram(this.partProg);
    } catch {}

    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  get frameCols(): number {
    return this.atlas.cols;
  }
}
