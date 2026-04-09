# Padrao Visual do Dashboard CodenLens

Este documento registra o padrao visual a ser repetido nas proximas telas do projeto, tomando como referencia o dashboard em `https://codenlens.jamesb.com.br/#` e os ajustes aprovados nesta iteracao.

## Objetivo

O visual do CodenLens deve parecer uma ferramenta de estudo pronta para uso, nao uma landing page nem um prototipo explicando a si mesmo.

## Principios

- Interface funcional antes de ser descritiva.
- Titulos curtos, labels tecnicos e nada de frases promocionais no miolo da tela.
- Densidade controlada: caber mais informacao relevante sem parecer apertado.
- Escala contida: cards, modais e areas de acao nao podem parecer inflados.
- A imagem da tecnologia complementa o card; ela nao domina o layout.

## Regras de Copy

- Evitar frases como "organize suas tecnologias", "mantenha o foco" ou textos que narram a funcionalidade.
- Usar apenas texto util ao usuario final:
  - `Tecnologias`
  - `Adicionar tecnologia`
  - `Nome da tecnologia`
  - `Imagem da tecnologia`
  - `2 conteudos`
- Descricoes auxiliares so entram quando forem operacionais, curtas e necessarias.

## Estrutura da Home

- Nao usar hero explicativo acima da grade principal.
- O conteudo principal da home deve abrir direto no painel de tecnologias.
- O painel principal ocupa toda a largura util disponivel.
- Em desktop, os cards de tecnologia devem aparecer em 3 colunas.
- Em tablet, 2 colunas.
- Em mobile, 1 coluna.

## Cards de Tecnologia

- Altura compacta.
- Conteudo visivel:
  - imagem
  - nome
  - quantidade de conteudos
  - acao de editar
  - indicacao visual de entrada
- Conteudo proibido no card:
  - progresso
  - aulas
  - analises
  - textos de apoio
  - chamadas explicativas como "abrir biblioteca"
- Estados:
  - ativo com leve reforco de borda/fundo
  - hover discreto, sem animacao exagerada

## Proporcao dos Cards

- Padding interno curto.
- Imagem quadrada pequena a media.
- Texto principal com no maximo duas linhas utilitarias:
  - nome
  - contador
- Borda arredondada moderada, menor que a usada em paineis heroicos.

## Modais

- Baseados no padrao compacto da referencia `C:\Users\james\Downloads\stitch (4)`.
- Largura curta a media, evitando modais panoramicos.
- Estrutura fixa:
  - cabecalho escuro levemente elevado
  - corpo com campos empilhados
  - rodape com acoes alinhadas a direita
- O modal principal de tecnologia deve conter apenas:
  - nome
  - URL da imagem
  - upload
  - preview simples da imagem carregada
  - icone para editar imagem
- Nao usar dentro dele:
  - paines de explicacao
  - dicas de marketing
  - preview grande lateral
  - blocos de recorte ocupando a tela principal

## Edicao de Imagem

- O upload continua simples.
- Depois que a imagem existir, exibir um preview pequeno com icone de editar.
- O recorte e redimensionamento acontecem em uma segunda janela enxuta.
- O editor de imagem deve ter:
  - area quadrada
  - arraste para reposicionar
  - slider de zoom
  - botoes `Cancelar` e `Aplicar`

## Linguagem Visual

- Fundo geral azul marinho profundo.
- Superficies em camadas proximas, sem contrastes artificiais.
- Destaques em azul/ciano apenas em acoes e foco.
- Bordas sutis.
- Sombra macia e controlada.

## Tipografia

- `Space Grotesk` ou equivalente para titulos curtos.
- `Inter` ou equivalente para corpo e labels.
- Evitar blocos de texto longos.
- Hierarquia enxuta:
  - titulo de secao
  - label
  - dado

## O que evitar nas proximas telas

- Hero sections com texto institucional.
- Cards gigantes.
- Paineis explicativos sobre o que a tela faz.
- Modais largos demais.
- Frases que descrevem o resultado do pedido em vez do produto.
- Acumulo de informacao secundaria na primeira dobra.

## Regra de adaptacao futura

Ao aplicar este padrao em outras areas do projeto, cada tela deve se perguntar:

1. O usuario precisa ler isso para usar a funcionalidade?
2. Esse bloco existe porque ajuda a tarefa ou porque preenche espaco?
3. Esse modal esta no tamanho minimo util?
4. O dado principal cabe sem competir com copy secundaria?

Se a resposta nao for objetiva, a interface deve ser simplificada antes de seguir.
