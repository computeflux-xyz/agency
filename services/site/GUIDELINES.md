I want you to develop a modern AstroJS website (typescript) that will be deployed on Cloudflare worker. The goal is to create a minimalistic freelance agency frontend that is top-notch in terms of SEO.

The visual (mega menu, page structure, divider) should mimic:

* https://tenstorrent.com (I like it ++, with pretext animation)
* https://www.modular.com/
* https://twenty.com/ (I like text animation/ascii animation. Could probably use pretext for that)
* https://www.anthropic.com/
* https://openai.com/fr-FR/

This is supposed to be a modern deep tech agency in 2026. Use visual trends that are proven to work (for example, I really like https://github.com/chenglou/pretext based text rendering animation)

The frontend will have a generated TS swagger client (put a placeholder for it in /lib/api)

In terms of TS project structure, I want you to adopt the "atomic" design philosophy (I have an example at /Users/gabrielmougard/go/src/github.com/bidding-platform/services/management_ui)

For the content, read PREVIOUS_CONVERSATION.md to have an idea of what to do in terms of content.

The site should also embed study cases / articles . I had a previous project that were "loading" ObservableHQ data (from a backend) and rendering them (see /Users/gabrielmougard/go/src/github.com/computeflux.xyz/deprecated/www)

Do not implement the API part yet but this could be as a next step. I want ALL these pages (even the loaded articles) to have an optimal SEO score and to be easily exported to social medias, etc.

* Explain what our expertise is.
    - This is done through a classic, no bullshit LP and some satellites info static pages.
* List the studies we worked on.
* Possibility to download "white paper" assets we might expose for free. (when we'll have an API)
* Possibility to "book" an appointment to meet us. (when we'll have an API)
* Possibility to apply for a job through our simple minimalist portal. (when we'll have an API)
* Register for a newsletter (when we'll have an API)
* Have an FAQ
* Must be mobile responsive

---

Finally, I have a Cloudflare based Astro site that you can inspire yourself from if you want at /Users/gabrielmougard/go/src/github.com/retargeting-site-template (inside this project, the model/ directory is unrelated, do not look at this dir)