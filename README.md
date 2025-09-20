# Reto Técnico - Optimización y Accesibilidad en Angular

## Descripción

Este proyecto es una aplicación web desarrollada con Angular que consume la API pública de Rick and Morty para mostrar una lista de personajes. El objetivo principal de este reto es mejorar el rendimiento y la accesibilidad de la aplicación mediante diversas optimizaciones en esta aplicación.

El reto está descrito en detalle en el siguiente documento: [Reto Técnico para Workshop L3](./Reto%20Técnico%20para%20Workshop%20L3.pdf).

## Requisitos

- Node.js y npm instalados en la máquina.
- Angular CLI instalado globalmente.
- Se realiza checkout a la rama base `feature/unit-test`:
  ```bash
    git checkout feature/unit-test
  ```
- Instalar las dependencias del proyecto:
  ```bash
    npm ci
  ```

## Retos

### **1. Optimización de Imágenes con `ngSrc`**:

- Se realiza un análisis con lighthouse para identificar problemas de rendimiento relacionados con las imágenes.
  - Se observa que hay una imagen crítica la cual es la cabecera de cada personaje, la cual impacta negativamente en el LCP (Largest Contentful Paint). Se puede ver el reporte detallado aquí: [LCP report](./docs/lighthouse-reports/1-lighthouse-previous.pdf)
    ![LCP discover](./docs/images/analysis-1-LCP.png)
- Se importa la directiva `NgOptimizedImage` en el archivo `app.module.ts` para habilitar la optimización de imágenes en Angular.
- Se realiza el reemplazo en las etiquetas `<img>` el atributo `src` por la directiva `ngSrc` de Angular para mejorar la carga y el rendimiento de las imágenes.
- Se especifican los atributos `width`, `height` para todas las imagenes con valores adecuados, y además se agrega el atributo `priority` para optimizar la carga de la imagen crítica reportada en el alto LCP desde lighthouse.
- Se vuelve a ejecutar el análisis con lighthouse para verificar las mejoras en el rendimiento. Se observa una mejora significativa en el rendimiento, pasando de 35% a 44%. Se puede ver el reporte detallado aquí: [LCP improved report](./docs/lighthouse-reports/1-lighthouse-previous)
  ![LCP improved](./docs/images/analysis-2-LCP.png)
