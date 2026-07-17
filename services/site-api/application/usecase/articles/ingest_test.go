package articles

import (
	"testing"

	"github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	"github.com/computeflux-xyz/agency/services/site-api/models"
	"github.com/stretchr/testify/assert"
)

func TestManifestChecksum_StableAndOrderIndependent(t *testing.T) {
	a := []contracts.IngestFileSpec{
		{Path: "index.html", SHA256: "aa"},
		{Path: "_npm/x.js", SHA256: "bb"},
	}
	b := []contracts.IngestFileSpec{
		{Path: "_npm/x.js", SHA256: "bb"},
		{Path: "index.html", SHA256: "aa"},
	}
	assert.Equal(t, manifestChecksum(a), manifestChecksum(b), "checksum must be order-independent")

	c := []contracts.IngestFileSpec{
		{Path: "index.html", SHA256: "aa"},
		{Path: "_npm/x.js", SHA256: "cc"}, // changed content
	}
	assert.NotEqual(t, manifestChecksum(a), manifestChecksum(c), "content change must change checksum")
}

func TestResolveEntrypoint(t *testing.T) {
	assert.Equal(t, "index.html", resolveEntrypoint([]contracts.IngestFileSpec{
		{Path: "_npm/x.js"}, {Path: "index.html"},
	}))
	assert.Equal(t, "report.html", resolveEntrypoint([]contracts.IngestFileSpec{
		{Path: "index.html"}, {Path: "report.html", IsEntrypoint: true},
	}), "explicit flag wins over index.html")
	assert.Equal(t, "", resolveEntrypoint([]contracts.IngestFileSpec{{Path: "_file/data.json"}}))
}

func TestAssetKindForPath(t *testing.T) {
	cases := map[string]models.AssetKind{
		"index.html":               models.AssetKindEntry,
		"_observablehq/runtime.js": models.AssetKindRuntime,
		"_npm/plot/x.js":           models.AssetKindNpm,
		"_import/components/t.js":  models.AssetKindImport,
		"_file/logo.svg":           models.AssetKindFile,
		"data.json":                models.AssetKindOther,
	}
	for path, want := range cases {
		assert.Equalf(t, want, assetKindForPath(path, false), "kind for %s", path)
	}
	assert.Equal(t, models.AssetKindEntry, assetKindForPath("_npm/weird.js", true), "explicit entry flag wins")
}

func TestVersionPrefix(t *testing.T) {
	uc := &IngestUseCase{cfg: IngestConfig{}}
	assert.Equal(t, "articles/blog/my-post/v3/", uc.versionPrefix(models.ArticleTypeBlog, "my-post", 3))

	withPrefix := &IngestUseCase{cfg: IngestConfig{KeyPrefix: "agency"}}
	assert.Equal(t, "agency/articles/study/case/v1/", withPrefix.versionPrefix(models.ArticleTypeStudy, "case", 1))
}

func TestValidateBegin(t *testing.T) {
	valid := contracts.IngestBeginRequest{
		Slug:  "apm-at-scale",
		Type:  models.ArticleTypeBlog,
		Title: "APM",
		Files: []contracts.IngestFileSpec{{Path: "index.html", SHA256: hex64(), IsEntrypoint: true}},
	}
	assert.NoError(t, validateBegin(valid))

	bad := valid
	bad.Slug = "Not A Slug"
	assert.Error(t, validateBegin(bad))

	noEntry := valid
	noEntry.Files = []contracts.IngestFileSpec{{Path: "_file/data.json", SHA256: hex64()}}
	assert.Error(t, validateBegin(noEntry), "missing entrypoint must fail")
}

func hex64() string {
	s := ""
	for i := 0; i < 64; i++ {
		s += "a"
	}

	return s
}
