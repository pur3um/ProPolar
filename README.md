# ProPolar: Progressive Polar Decomposition for Implicit Neural Representations

> **ProPolar: Progressive Polar Decomposition for Implicit Neural Representations**
>
> Pureum Kim, Younggeon Ryu, Dongyoon Lee, Hae Beom Lee<sup>†</sup>, Kyong Hwan Jin<sup>†</sup>
>
> Korea University, [IPA Lab](https://ipa.korea.ac.kr/)
>
> <sup>†</sup>Corresponding authors
>
> **NeurIPS 2026**

![Code](https://img.shields.io/badge/Code-Coming%20soon-lightgrey.svg?logo=github)

This repository hosts the **project page** for ProPolar. ProPolar orthogonalizes momentum within a low-rank
subspace whose rank grows during INR training, and holds the peak learning rate until the rank saturates.

## Authors

| Author | Affiliation |
| --- | --- |
| Pureum Kim | Korea University, IPA Lab |
| Younggeon Ryu | Korea University, IPA Lab |
| Dongyoon Lee | Korea University, IPA Lab |
| Hae Beom Lee<sup>†</sup> | Korea University, IPA Lab |
| Kyong Hwan Jin<sup>†</sup> | Korea University, IPA Lab |

<sup>†</sup>Corresponding authors

## Links

- **Project page**: to be added after deployment
- **Paper**: to be added
- **Code**: coming soon

## BibTeX

```bibtex
@inproceedings{kim2026propolar,
  title     = {{ProPolar}: Progressive Polar Decomposition for Implicit Neural Representations},
  author    = {Pureum Kim and Younggeon Ryu and Dongyoon Lee and Hae Beom Lee and Kyong Hwan Jin},
  booktitle = {Advances in Neural Information Processing Systems},
  year      = {2026}
}
```

## Site structure

| Path | Content |
| --- | --- |
| `index.html` | The page. Search for `TODO` to find the remaining links. |
| `static/css/propolar.css` | Page styles on top of the template's `index.css` |
| `static/js/propolar.js` | Comparison sliders, NeRF table tabs, lightbox, and the schedule plot |
| `static/js/index.js` | BibTeX copy and scroll-to-top from the template, without jQuery |
| `static/images/` | Figures extracted from the paper PDF at their original resolution |

## Before publishing

1. **Deploy.** Push to GitHub and enable Pages under *Settings → Pages* with the `main` branch and the root folder.
2. **Social preview.** Replace `USERNAME.github.io/ProPolar` in the `og:url`, `og:image`, and `twitter:image` tags with the live URL. Social cards need an absolute image URL.
3. **Paper links.** Replace `href="#"` on the OpenReview, PDF, and arXiv buttons. A button left as `#` does nothing on click.
4. **Code release.** Swap the grey `Code / Coming soon` element for the link template in the comment directly above it.
5. **Optional.** Wrap author names in links to their homepages.

## Acknowledgements

Built on the [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template) by Eliahu Horwitz, adapted from the [Nerfies](https://nerfies.github.io) project page, following the layout of the [TAG project page](https://hyeon-cho.github.io/TAG/).

## License

The website source is released under [CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/).
