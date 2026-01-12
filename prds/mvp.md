# PRD — Futevôlei Simulator

**Produto:** Simulador de Futevôlei 3D no Browser
**Codinome:** JunVolei
**Versão:** v0.1 (Protótipo Jogável)
**Status:** Discovery — _PRONTO PARA VIBECODING_

---

## 1. Visão do Produto

Um simulador de futevôlei 3D jogável no browser, onde você controla um jogador em uma partida 2v2 com 3 NPCs. O objetivo é criar uma experiência divertida e casual que capture a essência do futevôlei brasileiro.

### Por que Futevôlei?

- Esporte genuinamente brasileiro 🇧🇷
- Mecânicas simples mas desafiadoras
- Perfeito para partidas rápidas (5-10 min)
- Visual atraente (praia, sol, areia)
- Poucos jogos do gênero no mercado

### Experiência Alvo

O jogador deve sentir como se estivesse jogando na praia de Copacabana em um dia ensolarado. Controles intuitivos, física satisfatória da bola, e NPCs que jogam de forma realista mas não impossível de vencer.

---

## 2. Conceito do Jogo

### Formato da Partida

```
┌─────────────────────────────────────────┐
│                  REDE                    │
│═════════════════════════════════════════│
│                                          │
│    [NPC 1]              [NPC 2]         │  ← Time Adversário
│                                          │
│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│                                          │
│    [VOCÊ]               [NPC 3]         │  ← Seu Time
│                                          │
└─────────────────────────────────────────┘
                  QUADRA
```

- **Modalidade:** 2v2 (você + 1 NPC vs 2 NPCs)
- **Pontuação:** Primeiro a 12 pontos (ou configurável)
- **Toques:** Máximo 3 toques por time
- **Regras simplificadas:** Sem falta de mão, apenas pé/peito/cabeça

### Câmera

- **Visão:** 3ª pessoa, atrás e acima do jogador
- **Comportamento:** Segue o jogador suavemente
- **Ajuste:** Rotaciona levemente para mostrar a bola quando necessário

---

## 3. Escopo do MVP (Protótipo)

### ✅ Incluído no MVP

- Quadra de futevôlei 3D com rede
- Física básica da bola (gravidade, bounce, spin)
- 4 jogadores (1 controlável + 3 NPCs)
- Movimentação do jogador (andar, correr)
- Ações: chutar, cabecear, defender
- IA básica dos NPCs (seguir bola, atacar, defender)
- Sistema de pontuação
- Controles touch (mobile first)
- Ambiente de praia básico (areia, céu, sol)

### ❌ Fora do MVP

- Multiplayer online
- Customização de personagens
- Diferentes quadras/ambientes
- Torneios/campeonatos
- Sistema de progressão
- Áudio/música
- Replays
- Física avançada (vento, etc)

---

## 4. Mecânicas de Jogo

### Controles (Mobile First)

```
┌─────────────────────────────────────────┐
│                                          │
│            [ÁREA DO JOGO]               │
│                                          │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│   ┌───────┐                 ┌───────┐   │
│   │       │                 │  🦵   │   │
│   │ MOVE  │                 │ CHUTE │   │
│   │       │                 └───────┘   │
│   └───────┘                 ┌───────┐   │
│                             │  🗣️   │   │
│                             │CABEÇA │   │
│                             └───────┘   │
└─────────────────────────────────────────┘
```

| Controle                    | Ação         | Descrição                                           |
| --------------------------- | ------------ | --------------------------------------------------- |
| Joystick Virtual (esquerda) | Movimentação | Arrastar para mover o jogador                       |
| Botão Chute                 | Chutar bola  | Toque simples = chute normal, segurar = chute forte |
| Botão Cabeça                | Cabecear     | Usado quando bola está alta                         |
| Toque na tela               | Direção      | Direciona o chute/cabeceio para onde tocou          |

### Desktop (Fallback)

| Tecla        | Ação             |
| ------------ | ---------------- |
| WASD / Setas | Movimentação     |
| Espaço       | Chutar           |
| E            | Cabecear         |
| Mouse        | Direção do chute |

### Física da Bola

```javascript
// Parâmetros base da física
const BALL_PHYSICS = {
  gravity: -9.8,
  bounciness: 0.7, // Coeficiente de restituição
  airResistance: 0.02, // Arrasto do ar
  spinFactor: 0.3, // Efeito do spin na trajetória
  maxSpeed: 25, // Velocidade máxima m/s
};
```

### IA dos NPCs

**Comportamentos básicos:**

1. **Idle:** Posicionar-se na posição base
2. **Chase:** Ir em direção à bola quando próxima
3. **Attack:** Chutar/cabecear em direção ao campo adversário
4. **Defend:** Voltar para posição defensiva
5. **Support:** Posicionar-se para receber passe

**Níveis de dificuldade (futuro):**

- Fácil: Reação lenta, erros frequentes
- Médio: Reação normal, alguns erros
- Difícil: Reação rápida, poucos erros

### Sistema de Pontuação

```
PONTO MARCADO QUANDO:
- Bola toca o chão do lado adversário ✓
- Adversário toca a bola mais de 3 vezes ✓
- Bola sai pela lateral (ponto do outro time) ✓
- Bola passa por baixo da rede (ponto do outro time) ✓

PARTIDA TERMINA QUANDO:
- Um time chega a 12 pontos
- (MVP: sem regra de diferença de 2 pontos)
```

---

## 5. Arquitetura Técnica

### Stack

- **Engine 3D:** Three.js
- **Física:** Cannon.js ou Rapier (WASM)
- **UI:** HTML/CSS overlay ou Three.js sprites
- **Build:** Vite
- **Linguagem:** TypeScript
- **Controles Touch:** Nipple.js (joystick virtual)

### Estrutura do Projeto

```
junvolei/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   └── textures/
│       ├── sand.jpg
│       ├── sky.jpg
│       └── ball.png
├── src/
│   ├── main.ts              # Entry point
│   ├── game/
│   │   ├── Game.ts          # Game loop principal
│   │   ├── Scene.ts         # Setup da cena Three.js
│   │   └── GameState.ts     # Estado da partida
│   ├── entities/
│   │   ├── Player.ts        # Jogador controlável
│   │   ├── NPC.ts           # Jogadores controlados por IA
│   │   ├── Ball.ts          # Física e render da bola
│   │   ├── Court.ts         # Quadra e rede
│   │   └── Entity.ts        # Classe base
│   ├── systems/
│   │   ├── PhysicsSystem.ts # Sistema de física
│   │   ├── InputSystem.ts   # Captura de input
│   │   ├── AISystem.ts      # Lógica dos NPCs
│   │   └── ScoreSystem.ts   # Pontuação
│   ├── controls/
│   │   ├── TouchControls.ts # Controles mobile
│   │   └── KeyboardControls.ts # Controles desktop
│   ├── ui/
│   │   ├── HUD.ts           # Placar, controles visuais
│   │   └── Menu.ts          # Menu inicial/pausa
│   └── utils/
│       ├── constants.ts     # Constantes do jogo
│       └── helpers.ts       # Funções utilitárias
└── tests/
    └── ... (testes básicos)
```

### Geometrias e Modelos

Para o MVP, usaremos geometrias primitivas do Three.js:

| Elemento  | Geometria            | Textura                   |
| --------- | -------------------- | ------------------------- |
| Jogadores | CapsuleGeometry      | Cor sólida (time)         |
| Bola      | SphereGeometry       | Textura de vôlei genérica |
| Quadra    | PlaneGeometry        | Textura de areia          |
| Rede      | PlaneGeometry + Grid | Semi-transparente         |
| Postes    | CylinderGeometry     | Cor metálica              |

### Dimensões da Quadra

```
Quadra oficial de futevôlei (adaptada):
- Comprimento: 18m (9m cada lado)
- Largura: 9m
- Altura da rede: 2.2m (masculino)

No jogo (escala 1:1):
- Quadra: 18 x 9 unidades
- Rede: 9 x 2.2 unidades
- Jogadores: ~1.8 unidades de altura
- Bola: 0.22 unidades de diâmetro
```

---

## 6. Configurações

### Arquivo de Constantes

```typescript
// src/utils/constants.ts

export const GAME_CONFIG = {
  // Partida
  POINTS_TO_WIN: 12,
  MAX_TOUCHES: 3,

  // Física
  GRAVITY: -9.8,
  BALL_BOUNCE: 0.7,
  BALL_RADIUS: 0.11,

  // Quadra
  COURT_LENGTH: 18,
  COURT_WIDTH: 9,
  NET_HEIGHT: 2.2,

  // Jogadores
  PLAYER_HEIGHT: 1.8,
  PLAYER_SPEED: 5,
  PLAYER_SPRINT_MULTIPLIER: 1.5,

  // IA
  NPC_REACTION_TIME: 0.3, // segundos
  NPC_ACCURACY: 0.8, // 0-1

  // Câmera
  CAMERA_DISTANCE: 8,
  CAMERA_HEIGHT: 4,
  CAMERA_SMOOTHING: 0.1,
};
```

---

## 7. Game Loop

```
┌─────────────────────────────────────────────────────────┐
│                     GAME LOOP                            │
│                                                          │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐            │
│  │  INPUT   │ → │  UPDATE  │ → │  RENDER  │ → repeat   │
│  └──────────┘   └──────────┘   └──────────┘            │
│       │              │              │                    │
│       ▼              ▼              ▼                    │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐            │
│  │ Captura  │   │ Física   │   │ Three.js │            │
│  │ Touch/   │   │ IA NPCs  │   │ render() │            │
│  │ Keyboard │   │ Colisões │   │          │            │
│  └──────────┘   │ Pontuação│   └──────────┘            │
│                 └──────────┘                            │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Update

```typescript
update(deltaTime: number) {
  // 1. Processar input do jogador
  this.inputSystem.update();

  // 2. Atualizar IA dos NPCs
  this.aiSystem.update(deltaTime);

  // 3. Atualizar física (bola, colisões)
  this.physicsSystem.update(deltaTime);

  // 4. Checar pontuação
  this.scoreSystem.checkScore();

  // 5. Atualizar posições dos entities
  this.entities.forEach(e => e.update(deltaTime));

  // 6. Atualizar câmera
  this.camera.update(this.player.position);
}
```

---

## 8. Estados do Jogo

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  MENU   │ ──▶ │ PLAYING │ ──▶ │  SCORE  │
└─────────┘     └─────────┘     └─────────┘
     ▲               │               │
     │               ▼               │
     │          ┌─────────┐          │
     │          │  PAUSE  │          │
     │          └─────────┘          │
     │                               │
     └───────────────────────────────┘
```

| Estado    | Descrição                             |
| --------- | ------------------------------------- |
| MENU      | Tela inicial, botão "Jogar"           |
| PLAYING   | Partida em andamento                  |
| PAUSE     | Jogo pausado (mobile: toque no canto) |
| SCORE     | Alguém marcou ponto, breve pausa      |
| GAME_OVER | Partida finalizada, mostrar vencedor  |

---

## 9. Checkpoints de Execução (Ralph Loop)

### CP-01 — Setup do Projeto

**Goal:** Projeto inicializado com Three.js funcionando

**Files:**

- `package.json` — dependências
- `vite.config.ts` — configuração do Vite
- `tsconfig.json` — configuração TypeScript
- `index.html` — HTML base
- `src/main.ts` — entry point com cena básica

**Tasks:**

```bash
- npm init -y
- Instalar: three, @types/three, vite, typescript
- Criar cena com cubo rotacionando (smoke test)
- Configurar hot reload
```

**Success Criteria:**

- `npm run dev` abre browser com cubo 3D rotacionando
- Hot reload funciona

**Commit:** `feat: initial project setup with three.js`

---

### CP-02 — Quadra e Ambiente

**Goal:** Quadra de futevôlei renderizada com ambiente de praia

**Files:**

- `src/entities/Court.ts` — quadra e rede
- `src/game/Scene.ts` — configuração da cena
- `src/utils/constants.ts` — constantes do jogo
- `public/textures/` — texturas básicas

**Tasks:**

```bash
- Criar plano de areia (quadra)
- Criar rede com postes
- Adicionar iluminação (sol)
- Adicionar skybox ou cor de céu
- Marcar linhas da quadra
```

**Success Criteria:**

- Quadra visível com proporções corretas
- Rede no centro com altura correta
- Ambiente iluminado de forma agradável

**Commit:** `feat: add beach volleyball court and environment`

---

### CP-03 — Jogador Controlável

**Goal:** Personagem que o jogador controla, com movimentação

**Files:**

- `src/entities/Player.ts` — jogador controlável
- `src/entities/Entity.ts` — classe base
- `src/controls/KeyboardControls.ts` — controles desktop
- `src/systems/InputSystem.ts` — sistema de input

**Tasks:**

```bash
- Criar modelo do jogador (capsule/box)
- Implementar movimentação WASD
- Limitar movimento à área da quadra (seu lado)
- Configurar câmera 3ª pessoa seguindo jogador
```

**Success Criteria:**

- Jogador renderiza na quadra
- Movimentação suave com WASD
- Câmera segue o jogador
- Jogador não atravessa limites

**Commit:** `feat: add controllable player with movement`

---

### CP-04 — Física da Bola

**Goal:** Bola com física realista

**Files:**

- `src/entities/Ball.ts` — bola com física
- `src/systems/PhysicsSystem.ts` — sistema de física

**Tasks:**

```bash
- Criar esfera (bola) com textura
- Implementar gravidade
- Implementar bounce no chão
- Implementar colisão com rede
- Bola para quando sai dos limites
```

**Success Criteria:**

- Bola cai com gravidade realista
- Bola quica no chão de forma convincente
- Bola não atravessa a rede
- Bola detecta quando sai da quadra

**Commit:** `feat: add ball with physics`

---

### CP-05 — Ações do Jogador

**Goal:** Jogador pode chutar e cabecear a bola

**Files:**

- `src/entities/Player.ts` — adicionar ações
- `src/systems/PhysicsSystem.ts` — colisão jogador-bola

**Tasks:**

```bash
- Detectar colisão jogador-bola
- Implementar chute (tecla espaço)
- Implementar cabeceio (tecla E)
- Direcionar bola baseado na orientação do jogador
- Adicionar força ao chute baseado em "carregar"
```

**Success Criteria:**

- Jogador chuta a bola quando próximo + tecla
- Cabeceio funciona para bola alta
- Direção do chute faz sentido
- Força do chute é controlável

**Commit:** `feat: add player kick and header actions`

---

### CP-06 — NPCs Básicos

**Goal:** 3 NPCs com IA básica

**Files:**

- `src/entities/NPC.ts` — jogadores IA
- `src/systems/AISystem.ts` — lógica de IA

**Tasks:**

```bash
- Criar 3 NPCs (1 aliado, 2 adversários)
- Posicioná-los nas posições corretas
- IA: ir em direção à bola quando próxima
- IA: chutar bola para o outro lado
- IA: retornar à posição base
```

**Success Criteria:**

- 4 jogadores na quadra (você + 3 NPCs)
- NPCs se movem em direção à bola
- NPCs chutam a bola
- NPCs não ficam parados indefinidamente

**Commit:** `feat: add NPC players with basic AI`

---

### CP-07 — Sistema de Pontuação

**Goal:** Pontuação funcionando com regras de futevôlei

**Files:**

- `src/systems/ScoreSystem.ts` — pontuação
- `src/game/GameState.ts` — estado da partida
- `src/ui/HUD.ts` — placar visual

**Tasks:**

```bash
- Detectar quando bola toca o chão
- Determinar qual time marcou ponto
- Contar toques por time (máx 3)
- Mostrar placar na tela
- Reset posições após ponto
- Detectar fim de jogo (12 pontos)
```

**Success Criteria:**

- Ponto marcado quando bola cai no chão
- Placar atualiza corretamente
- Posições resetam após ponto
- Jogo termina ao atingir 12 pontos

**Commit:** `feat: add scoring system and HUD`

---

### CP-08 — Controles Mobile

**Goal:** Jogo jogável em dispositivos móveis

**Files:**

- `src/controls/TouchControls.ts` — controles touch
- `src/ui/HUD.ts` — botões visuais

**Tasks:**

```bash
- Instalar/configurar nipple.js
- Criar joystick virtual (esquerda)
- Criar botões de ação (direita)
- Adaptar layout para mobile
- Testar em viewport mobile
```

**Success Criteria:**

- Joystick virtual funciona para movimento
- Botões de chute/cabeça funcionam
- Layout responsivo
- Jogável em tela touch

**Commit:** `feat: add mobile touch controls`

---

### CP-09 — Menu e Estados

**Goal:** Menu inicial e estados do jogo

**Files:**

- `src/ui/Menu.ts` — menu principal
- `src/game/Game.ts` — gerenciar estados

**Tasks:**

```bash
- Criar tela de menu inicial
- Botão "Jogar" inicia partida
- Pausa (toque no canto ou ESC)
- Tela de fim de jogo com resultado
- Botão "Jogar Novamente"
```

**Success Criteria:**

- Menu aparece ao abrir o jogo
- Partida inicia ao clicar "Jogar"
- Pausa funciona
- Fim de jogo mostra vencedor

**Commit:** `feat: add game menu and state management`

---

### CP-10 — Polish e Ajustes

**Goal:** Jogo fluido e jogável

**Tasks:**

```bash
- Ajustar física da bola (bounce, velocidade)
- Ajustar IA dos NPCs (não muito fácil/difícil)
- Ajustar câmera (suavidade, ângulo)
- Ajustar controles (responsividade)
- Fix bugs encontrados
- Testar partida completa
```

**Success Criteria:**

- Partida jogável do início ao fim
- Não há bugs críticos
- Experiência é divertida
- Funciona em mobile e desktop

**Commit:** `chore: polish gameplay and fix bugs`

---

### CP-11 — Deploy (Opcional)

**Goal:** Jogo acessível online

**Tasks:**

```bash
- Build de produção
- Deploy no Vercel/Netlify/GitHub Pages
- Testar em dispositivos reais
```

**Success Criteria:**

- URL pública funcionando
- Jogo carrega e roda bem

**Commit:** `chore: deploy to production`

---

## 10. Comando Ralph Loop

Para executar este PRD:

```bash
/ralph-loop:ralph-loop "Leia o PRD em ./prd.md. Implemente o simulador de futevôlei JunVolei seguindo os checkpoints em ordem (CP-01 a CP-10). Para cada checkpoint: 1) Implemente o código necessário 2) Teste manualmente se funciona 3) Faça commit. Foque em ter algo jogável, não perfeito. Se ficar preso em um checkpoint por mais de 10 iterações, documente em errors.md e tente o próximo. Ao completar todos os checkpoints com jogo funcionando, emita <promise>COMPLETE</promise>" --completion-promise "<promise>COMPLETE</promise>" --max-iterations 100
```

---

## 11. Referências Visuais

### Inspirações de Gameplay

- Beach Volleyball (jogos de vôlei de praia arcade)
- FIFA Street (controles simplificados)
- Rocket League (física satisfatória)

### Assets Gratuitos

- [Three.js Examples](https://threejs.org/examples/)
- [Kenney Assets](https://kenney.nl/assets) - texturas e modelos grátis
- [Poly Haven](https://polyhaven.com/) - HDRIs e texturas
- [Mixamo](https://www.mixamo.com/) - animações (futuro)

### Documentação

- [Three.js Docs](https://threejs.org/docs/)
- [Cannon.js Docs](https://schteppe.github.io/cannon.js/docs/)
- [Nipple.js](https://yoannmoi.net/nipplejs/) - joystick virtual

---

## 12. Métricas de Sucesso (Protótipo)

| Métrica                    | Target                     |
| -------------------------- | -------------------------- |
| Tempo para primeira jogada | < 5 segundos após carregar |
| FPS em mobile              | > 30 FPS estável           |
| Partida completa sem crash | 100%                       |
| Controles intuitivos       | Jogável sem tutorial       |
| Diversão                   | Você quer jogar de novo    |

---

## 13. Riscos e Mitigações

| Risco                      | Impacto       | Mitigação                               |
| -------------------------- | ------------- | --------------------------------------- |
| Performance ruim em mobile | Não jogável   | Geometrias simples, otimizar render     |
| Física bugada              | Frustração    | Usar biblioteca testada (Cannon/Rapier) |
| IA muito difícil/fácil     | Não divertido | Ajustar parâmetros iterativamente       |
| Controles touch ruins      | Não jogável   | Testar muito, ajustar tamanho/posição   |
| Escopo grande demais       | Não termina   | Focar no MVP, cortar features           |

---

## 14. Futuro (Pós-MVP)

Se o protótipo ficar bom, próximos passos:

1. **Animações** - Jogadores com animações de chute, cabeceio
2. **Áudio** - Sons de chute, ambiente de praia, trilha
3. **Multiplayer Local** - 2 jogadores no mesmo dispositivo
4. **Customização** - Cores do time, aparência do jogador
5. **Níveis de Dificuldade** - IA ajustável
6. **Multiplayer Online** - WebRTC ou servidor
7. **Campeonatos** - Modo carreira

---

**Última atualização:** Janeiro 2026
**Autor:** Vibecoding session incoming 🏐🏖️
