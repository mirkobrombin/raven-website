# Raven website

To install dependencies and start:

```sh
npm install
npm run dev
```

The development server listens on `0.0.0.0:9284` with hot reload.

```sh
npm run build
npm run preview
```


## Publishing

`.github/workflows/pages.yml` builds and deploys `main` through GitHub Actions to GitHub Pages. It uses the custom domain already configured in the repository settings. No branch-based Pages publishing or `CNAME` file is needed. Pull requests build and validate without deploying.

Benchmark data is kept in this repository so a standalone checkout builds without the runtime source. `npm run sync:benchmarks` explicitly imports the aggregate from a sibling `go-vm` checkout when present; review the data, evidence status and charts before committing it. Normal builds do not change the benchmark inputs. Current aggregates remain preliminary, and the ClassiCube game series is withheld from page comparisons until its run configuration is verified.
