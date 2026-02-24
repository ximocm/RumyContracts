# Orquestación de agentes para implementar RumyContracts

Este documento define cómo coordinar múltiples agentes para implementar, de forma incremental, las funcionalidades pedidas:

- jugadores máquina,
- repartir cartas,
- crear mesas,
- ver la mano,
- ordenar la mano,

cumpliendo las reglas del `README.md` (contratos por ronda, turnos, bajarse/cerrar, comodines y puntuación).

## 1) Estructura de agentes

## Agente 0 — Coordinador técnico
**Responsabilidad**
- Mantener backlog, prioridades y dependencias.
- Integrar PRs de los demás agentes.
- Validar que todas las reglas del README se respetan.

**Entradas**
- Requisitos funcionales del usuario.
- Reglas de juego del README.

**Salidas**
- Roadmap por sprints.
- Checklists de aceptación global.

---

## Agente 1 — Motor de reglas (Game Core)
**Responsabilidad**
- Modelar el estado del juego: rondas, contrato, turno, mazo, descarte, manos, mesa y puntuación.
- Implementar flujo de turno: robar (mazo/descarte) + descartar.
- Implementar reglas de bajarse, cerrar, añadir cartas y comodines.

**Entregables**
- Módulos puros y testeables de reglas.
- Validadores por contrato de ronda:
  - 1 trío + 1 escalera,
  - 2 escaleras,
  - 3 tríos,
  - 1 trío + 2 escaleras (sin bajarse).

---

## Agente 2 — Reparto y ciclo de ronda
**Responsabilidad**
- Inicialización de partida y ronda.
- Repartir cartas según contrato/ronda.
- Preparar mazo y descarte en estado válido.

**Entregables**
- Función de inicio de ronda (determinista cuando haya semilla).
- Pruebas de reparto (número correcto por jugador y consistencia de mazo/descarte).

---

## Agente 3 — IA de jugadores máquina
**Responsabilidad**
- Implementar bot v1 heurístico:
  - elegir robo (mazo/descarte) según utilidad para contrato,
  - elegir descarte por menor utilidad y/o mayor coste,
  - decidir cuándo bajarse.

**Entregables**
- API de decisiones de IA desacoplada de la UI.
- Batería de escenarios de regresión (casos simples por contrato).

---

## Agente 4 — Mesas y lobby
**Responsabilidad**
- Crear mesa, unirse/salir, iniciar partida.
- Aislar estado por mesa para no mezclar partidas.

**Entregables**
- Gestor de mesas (`tableId`, jugadores, configuración, estado).
- Flujo mínimo de lobby funcional.

---

## Agente 5 — UI de mano y ordenación
**Responsabilidad**
- Mostrar mano del jugador correctamente.
- Permitir ordenar mano (valor, palo, utilidad para contrato).
- Mantener orden local de mano sin romper lógica de juego.

**Entregables**
- Componente/vista de mano.
- Controles de ordenación + persistencia de criterio en sesión.

---

## Agente 6 — QA y reglas de puntuación
**Responsabilidad**
- Validar puntuación por carta restante al cierre de ronda.
- Validar ganador final al terminar 4 rondas (menor puntuación).
- Tests de regresión de reglas críticas.

**Entregables**
- Suite de pruebas funcionales y de reglas.
- Checklist de aceptación final por funcionalidad.

---

## 2) Orden de ejecución (dependencias)

1. **Agente 1 (Game Core)**
2. **Agente 2 (Reparto y ronda)**
3. **Agente 5 (Ver/ordenar mano, base UI)**
4. **Agente 3 (IA máquina)**
5. **Agente 4 (Mesas/lobby)**
6. **Agente 6 (QA/puntuación)**
7. **Agente 0 (integración final continua en paralelo)**

> Motivo: primero se estabilizan reglas y estado; luego UI y automatización (IA/mesas); finalmente cierre de calidad.

## 3) Backlog por sprints

## Sprint 1 — Núcleo jugable local
- Estado de partida/ronda/turno.
- Reparto de cartas.
- Robar y descartar.
- Mostrar mano.

**DoD Sprint 1**
- Se puede iniciar ronda y jugar turnos básicos sin errores.

## Sprint 2 — Contratos y ordenación de mano
- Validación completa de contratos por ronda.
- Ordenar mano por distintos criterios.
- Primer corte visual estable.

**DoD Sprint 2**
- El usuario puede organizar su mano y validar progreso del contrato.

## Sprint 3 — IA máquina + mesas
- Bots v1 jugables.
- Crear/unirse/iniciar mesa.
- Partidas aisladas por mesa.

**DoD Sprint 3**
- Partida completa humano+máquina en una mesa.

## Sprint 4 — Reglas avanzadas + cierre
- Bajarse/cerrar.
- Añadir cartas a jugadas en mesa.
- Intercambio de comodines.
- Puntuación por ronda y total.

**DoD Sprint 4**
- Se completan 4 rondas y se determina ganador correcto.

## 4) Contrato de integración entre agentes

Cada agente entrega:
- PR pequeño y enfocado.
- Pruebas automatizadas del módulo.
- Notas de compatibilidad (si rompe API interna, debe incluir migración).

Formato de handoff:
1. Qué implementa.
2. Qué no implementa.
3. Casos borde cubiertos.
4. Comandos de prueba.

## 5) Riesgos y mitigaciones

- **Riesgo:** Ambigüedad en “cartas justas por contrato”.
  - **Mitigación:** definir tabla fija por ronda en el core y documentarla.

- **Riesgo:** IA juega “legal” pero poco útil.
  - **Mitigación:** empezar con IA v1 simple y añadir heurísticas por contrato en v2.

- **Riesgo:** UI rompe reglas de estado.
  - **Mitigación:** core inmutable/puro; UI solo dispara acciones validadas por motor.

- **Riesgo:** regresiones al tocar contratos.
  - **Mitigación:** tests parametrizados por contrato/ronda.

## 6) Criterios de aceptación global

- Existe flujo completo de partida en 4 rondas.
- Se soportan jugadores máquina.
- Se puede crear mesa y jugar en ella.
- El jugador ve y ordena su mano.
- Se aplican reglas de bajarse/cerrar/comodín y puntuación final.

## 7) Métricas de avance para el coordinador

- % de historias cerradas por sprint.
- % de cobertura en motor de reglas.
- Nº de bugs de reglas abiertos/cerrados por sprint.
- Tiempo medio de integración por PR.
