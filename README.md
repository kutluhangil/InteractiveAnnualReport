<div align="center">

<img src="docs/media/hero.svg" alt="London Bee Report — a Thames corridor map with rooftop hives, bees along the river, headline counters and the rooftop calculator" width="100%">

<p>
  <img alt="React" src="https://img.shields.io/badge/React-Vite-ffc53d?style=for-the-badge&labelColor=0c0f07">
  <img alt="D3" src="https://img.shields.io/badge/D3-geo%20maps-7cc36b?style=for-the-badge&labelColor=0c0f07">
  <img alt="Recharts" src="https://img.shields.io/badge/Recharts-impact%20curves-ff8a3d?style=for-the-badge&labelColor=0c0f07">
  <img alt="PDF" src="https://img.shields.io/badge/export-PDF-ffc53d?style=for-the-badge&labelColor=0c0f07">
</p>

<p><em>An interactive 2025/26 annual report for a concept urban rewilding project:<br>
52 rooftop apiaries and wildflower meadows across 11 London boroughs, and what they changed.</em></p>

</div>

<img src="docs/media/divider.svg" width="100%" alt="">

## What it is

Annual reports are usually a PDF nobody opens. This one is a page you explore: a pollinator map of the Thames corridor, biodiversity curves you can filter, a stormwater and urban-heat simulator, and community stories, with a one-click PDF export at the end.

| 11 | 52 | 194 | 9.7M+ |
|:-:|:-:|:-:|:-:|
| boroughs | rooftops | hives | bees |

<img src="docs/media/divider.svg" width="100%" alt="">

## Features

| | |
|---|---|
| **Pollinator map** | A D3-geo map of the boroughs with rooftop sites and corridors you can hover and select. |
| **Biodiversity curves** | Species and pollinator counts over the season, filterable by borough. |
| **Climate simulator** | Rainwater retention and urban heat-island effects of the green roofs. |
| **Community impact** | Honey donated to food banks, volunteer hours and school visits. |
| **Pollen calendar** | Month by month across 2026, filterable by cohort: honeybees, bumblebees, solitary and mason bees, and the rooftop nectar flow. |
| **Rooftop calculator** | Slide a roof from 50 to 1000 m² and see the microclimate cooling, native biodiversity and community harvest it would add. |
| **Food sharing** | The raw harvest and the jars donated to food banks. |
| **Education** | Rooftop lab field trips and youth and community attendees. |
| **Roadmap** | The strategic goals for the next season and a pledge target. |
| **Share and read** | Share cards for each key finding, a reading-time estimate in the navbar, light and dark themes. |
| **PDF export** | The whole report laid out for print through `html2pdf.js`. |

<img src="docs/media/divider.svg" width="100%" alt="">

## Reading order

The page is a long scroll that reads like a report, with motion only where it carries meaning (numbers counting up as they enter, charts drawing in):

| Section | What it shows |
|---|---|
| Overview | The headline figures for the season |
| Borough corridor | All 11 active boroughs on the D3-geo map, with zoom and per-borough metrics |
| Biodiversity growth | Species and pollinator streams over the season |
| Pollen calendar | What is flowering and who is feeding, month by month |
| Stormwater and climate | Water captured and native plant species per roof |
| Sector impact | How the work lands across sectors |
| Food sharing · education | The community side: honey, jars, field trips, attendees |
| Stories | Short narratives from the rooftops |
| Roadmap and thanks | Next season's goals and the people who made it happen |

<img src="docs/media/divider.svg" width="100%" alt="">

## Türkçe özet

**London Bee Project Interactive Annual Report**, Londra'nın 11 ilçesindeki 52 çatı arılığı ve yaban çiçeği çayırının ekolojik, iklimsel ve toplumsal etkilerini gösteren etkileşimli bir yıllık rapor. Thames koridorunun polinatör haritası, filtrelenebilir biyoçeşitlilik eğrileri, yağmur suyu ve kentsel ısı adası simülatörü ve topluluk hikâyeleri içeriyor; rapor tek tıkla PDF olarak indirilebiliyor. Kavramsal bir proje için hazırlanmış bir veri görselleştirme çalışması.

<img src="docs/media/divider.svg" width="100%" alt="">

## Development

```sh
npm install
npm run dev                  # http://localhost:3000
npm run build
npm run lint                 # tsc --noEmit
```

```
src/components/   map, charts, simulator, story sections, export
src/data/         boroughs, sites, metrics
src/utils/        PDF export, reading time, motion presets
src/context/      light / dark theme
```

<div align="center">
<br>
<a href="https://github.com/kutluhangil"><img src="docs/media/signature.svg" width="100%" alt="Built by kutluhangil"></a>
<sub>A data-visualisation study · the project and its figures are illustrative.</sub>
</div>
