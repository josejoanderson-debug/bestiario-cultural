export type PhotoLedgerItem = {
  image: string;
  label: string;
  url: string;
  kind?: "documentary" | "contextual-reference";
};

const commons = (file: string) => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}`;

/**
 * Fallback fotográfico externo. O seed do Supabase tenta substituir
 * estes fallbacks por imagens encontradas automaticamente no Wikimedia Commons.
 */
export const photoLedger: Record<string, PhotoLedgerItem> = {
  "bumba-meu-boi": { image: commons("Bumba meu boi - Maranhão, Brasil.jpg"), label: "Wikimedia Commons · Bumba Meu Boi", url: "https://commons.wikimedia.org/wiki/File:Bumba_meu_boi_-_Maranh%C3%A3o,_Brasil.jpg" },
  forro: { image: commons("Festa de forró.jpg"), label: "Wikimedia Commons · Forró", url: "https://commons.wikimedia.org/wiki/File:Festa_de_forr%C3%B3.jpg" },
  "coco-de-roda": { image: commons("Coco de roda - dance from northeast of Brazil.jpg"), label: "Wikimedia Commons · Coco de Roda", url: "https://commons.wikimedia.org/wiki/File:Coco_de_roda_-_dance_from_northeast_of_Brazil.jpg" },
  "quadrilha-junina": { image: commons("Quadrilha junina na Bahia.jpg"), label: "Wikimedia Commons · Quadrilha Junina", url: "https://commons.wikimedia.org/wiki/File:Quadrilha_junina_na_Bahia.jpg" },
  maracatu: { image: commons("Maracatu Blackface Queen.jpg"), label: "Wikimedia Commons · Maracatu", url: "https://commons.wikimedia.org/wiki/File:Maracatu_Blackface_Queen.jpg" },
  "cavalo-marinho": { image: commons("Cavalo Marinho.jpg"), label: "Wikimedia Commons · Cavalo-Marinho", url: "https://commons.wikimedia.org/wiki/File:Cavalo_Marinho.jpg" },
  "repente-cordel": { image: commons("Literatura de cordel REFON.jpg"), label: "Wikimedia Commons · Literatura de Cordel", url: "https://commons.wikimedia.org/wiki/File:Literatura_de_cordel_REFON.jpg" },
  "carnaval-de-rua": { image: commons("Carnaval de rua 2024.jpg"), label: "Wikimedia Commons · Carnaval de Rua", url: "https://commons.wikimedia.org/wiki/File:Carnaval_de_rua_2024.jpg" },
  fandango: { image: commons("Fandango CTG.webm"), label: "Wikimedia Commons · Fandango", url: "https://commons.wikimedia.org/wiki/File:Fandango_CTG.webm" },
  ciranda: { image: commons("Ciranda (dança).jpg"), label: "Wikimedia Commons · Ciranda", url: "https://commons.wikimedia.org/wiki/File:Ciranda_(dan%C3%A7a).jpg" },
  pastoril: { image: commons("Reisado Cearense.jpg"), label: "Wikimedia Commons · Folguedos do ciclo natalino", url: "https://commons.wikimedia.org/wiki/File:Reisado_Cearense.jpg" , kind: "contextual-reference"},
  reisado: { image: commons("Reisado Cearense.jpg"), label: "Wikimedia Commons · Reisado", url: "https://commons.wikimedia.org/wiki/File:Reisado_Cearense.jpg" },
  baiao: { image: commons("Luiz Gonzaga 1988.png"), label: "Wikimedia Commons · Luiz Gonzaga", url: "https://commons.wikimedia.org/wiki/File:Luiz_Gonzaga_1988.png" },
  xaxado: { image: commons("Apresentação do Grupo de Dança Xaxado (19529557050).jpg"), label: "Wikimedia Commons · Xaxado", url: "https://commons.wikimedia.org/wiki/File:Apresenta%C3%A7%C3%A3o_do_Grupo_de_Dan%C3%A7a_Xaxado_(19529557050).jpg" },
  cangaco: { image: commons("Vestimenta de cangaceiro.jpg"), label: "Wikimedia Commons · Cangaço", url: "https://commons.wikimedia.org/wiki/File:Vestimenta_de_cangaceiro.jpg" },
  "artesanato-de-barro": { image: commons("Maragogipinho Bahia Olaria 2019-2-5.jpg"), label: "Wikimedia Commons · Cerâmica popular", url: "https://commons.wikimedia.org/wiki/File:Maragogipinho_Bahia_Olaria_2019-2-5.jpg" },
  "renda-renascenca": { image: commons("RENDEIRA FAZENDO RENDA RENASCENÇA.jpg"), label: "Wikimedia Commons · Renda Renascença", url: "https://commons.wikimedia.org/wiki/File:RENDEIRA_FAZENDO_RENDA_RENASCEN%C3%87A.jpg" },
  "ceramica-de-caruaru": { image: commons("Potes de Barro - Feira de Caruaru 1990.jpg"), label: "Wikimedia Commons · Cerâmica de Caruaru", url: "https://commons.wikimedia.org/wiki/File:Potes_de_Barro_-_Feira_de_Caruaru_1990.jpg" },
  lapinha: { image: commons("Presépio, lapinha rochinha minimalista.jpg"), label: "Wikimedia Commons · Presépio/Lapinha", url: "https://commons.wikimedia.org/wiki/File:Pres%C3%A9pio,_lapinha_rochinha_minimalista.jpg" },
  "festa-de-sao-joao": { image: commons("Festa junina Festa de São João periperi Raul Golinelli Salvador Bahia 01.jpg"), label: "Wikimedia Commons · Festa Junina", url: "https://commons.wikimedia.org/wiki/File:Festa_junina_Festa_de_S%C3%A3o_Jo%C3%A3o_periperi_Raul_Golinelli_Salvador_Bahia_01.jpg" },
};
