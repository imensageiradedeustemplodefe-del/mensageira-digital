-- Criar tabela para versículos bíblicos edificantes
CREATE TABLE public.daily_verses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  verse_text TEXT NOT NULL,
  verse_reference TEXT NOT NULL,
  book_name TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse_number TEXT NOT NULL,
  category TEXT DEFAULT 'geral'::text,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.daily_verses ENABLE ROW LEVEL SECURITY;

-- Política para visualização pública
CREATE POLICY "Everyone can view active verses" 
ON public.daily_verses 
FOR SELECT 
USING (is_active = true);

-- Política para administradores gerenciarem
CREATE POLICY "Admins can manage verses" 
ON public.daily_verses 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_daily_verses_updated_at
BEFORE UPDATE ON public.daily_verses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Popular com versículos edificantes (100+ versículos)
INSERT INTO public.daily_verses (verse_text, verse_reference, book_name, chapter, verse_number, category) VALUES

-- Esperança e Fé
('Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o SENHOR; pensamentos de paz, e não de mal, para vos dar o fim que esperais.', 'Jeremias 29:11', 'Jeremias', 29, '11', 'esperanca'),
('Tudo posso naquele que me fortalece.', 'Filipenses 4:13', 'Filipenses', 4, '13', 'forca'),
('O SENHOR é o meu pastor; nada me faltará.', 'Salmos 23:1', 'Salmos', 23, '1', 'confianca'),
('Entrega o teu caminho ao SENHOR; confia nele, e ele tudo fará.', 'Salmos 37:5', 'Salmos', 37, '5', 'confianca'),
('E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.', 'Romanos 8:28', 'Romanos', 8, '28', 'esperanca'),
('Não tema, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.', 'Isaías 41:10', 'Isaías', 41, '10', 'coragem'),
('Buscar-me-eis, e me achareis, quando me buscardes com todo o vosso coração.', 'Jeremias 29:13', 'Jeremias', 29, '13', 'busca'),

-- Paz e Descanso
('Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.', 'João 14:27', 'João', 14, '27', 'paz'),
('Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.', 'Mateus 11:28', 'Mateus', 11, '28', 'descanso'),
('A paz vos deixo, a minha paz vos dou.', 'João 14:27a', 'João', 14, '27', 'paz'),
('Aquietai-vos, e sabei que eu sou Deus.', 'Salmos 46:10', 'Salmos', 46, '10', 'paz'),
('Em paz me deitarei, e logo dormirei, porque só tu, SENHOR, me fazes repousar seguro.', 'Salmos 4:8', 'Salmos', 4, '8', 'descanso'),

-- Amor de Deus
('Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.', 'João 3:16', 'João', 3, '16', 'amor'),
('Mas Deus prova o seu amor para conosco, em que Cristo morreu por nós, sendo nós ainda pecadores.', 'Romanos 5:8', 'Romanos', 5, '8', 'amor'),
('Nisto conhecemos o amor de Deus: em que Cristo deu a sua vida por nós.', '1 João 3:16', '1 João', 3, '16', 'amor'),
('O amor de Deus está derramado em nossos corações pelo Espírito Santo.', 'Romanos 5:5b', 'Romanos', 5, '5', 'amor'),

-- Provisão e Cuidado
('O meu Deus, segundo as suas riquezas, suprirá todas as vossas necessidades em glória, por Cristo Jesus.', 'Filipenses 4:19', 'Filipenses', 4, '19', 'provisao'),
('Portanto, não vos inquieteis, dizendo: Que comeremos, ou que beberemos, ou com que nos vestiremos? Mas buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.', 'Mateus 6:31,33', 'Mateus', 6, '31,33', 'provisao'),
('Olhai para as aves do céu, que nem semeiam, nem segam, nem ajuntam em celeiros; e vosso Pai celestial as alimenta. Não tendes vós muito mais valor do que elas?', 'Mateus 6:26', 'Mateus', 6, '26', 'cuidado'),
('Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.', '1 Pedro 5:7', '1 Pedro', 5, '7', 'cuidado'),

-- Sabedoria e Direção
('Se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente, e o não lança em rosto, e ser-lhe-á dada.', 'Tiago 1:5', 'Tiago', 1, '5', 'sabedoria'),
('Confia no SENHOR de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.', 'Provérbios 3:5-6', 'Provérbios', 3, '5-6', 'direcao'),
('Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.', 'Salmos 119:105', 'Salmos', 119, '105', 'direcao'),
('Os passos do homem bom são confirmados pelo SENHOR, e deleita-se no seu caminho.', 'Salmos 37:23', 'Salmos', 37, '23', 'direcao'),

-- Perdão e Misericórdia
('Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar os pecados, e nos purificar de toda a injustiça.', '1 João 1:9', '1 João', 1, '9', 'perdao'),
('Quanto está longe o oriente do ocidente, assim afasta de nós as nossas transgressões.', 'Salmos 103:12', 'Salmos', 103, '12', 'perdao'),
('As misericórdias do SENHOR são a causa de não sermos consumidos, porque as suas misericórdias não têm fim.', 'Lamentações 3:22', 'Lamentações', 3, '22', 'misericordia'),

-- Força e Coragem
('Esforça-te, e tem bom ânimo; não temas, nem te espantes; porque o SENHOR teu Deus é contigo, por onde quer que andares.', 'Josué 1:9', 'Josué', 1, '9', 'coragem'),
('O SENHOR é a minha luz e a minha salvação; a quem temerei? O SENHOR é a força da minha vida; de quem me recearei?', 'Salmos 27:1', 'Salmos', 27, '1', 'forca'),
('O que dizes tu, ó Jacó, e tu falas, ó Israel: O meu caminho está encoberto ao SENHOR, e o meu direito passa despercebido ao meu Deus? Não sabes, não ouviste que o eterno Deus, o SENHOR, o Criador dos fins da terra, nem se cansa nem se fatiga?', 'Isaías 40:27-28', 'Isaías', 40, '27-28', 'forca'),

-- Alegria e Gratidão
('Este é o dia que fez o SENHOR; regozijemo-nos, e alegremo-nos nele.', 'Salmos 118:24', 'Salmos', 118, '24', 'alegria'),
('Alegrai-vos sempre no Senhor; outra vez digo, alegrai-vos.', 'Filipenses 4:4', 'Filipenses', 4, '4', 'alegria'),
('Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.', '1 Tessalonicenses 5:18', '1 Tessalonicenses', 5, '18', 'gratidao'),
('Servi ao SENHOR com alegria; apresentai-vos a ele com regozijo.', 'Salmos 100:2', 'Salmos', 100, '2', 'alegria'),

-- Oração e Comunhão
('Orai sem cessar.', '1 Tessalonicenses 5:17', '1 Tessalonicenses', 5, '17', 'oracao'),
('E tudo o que pedirdes em oração, crendo, o recebereis.', 'Mateus 21:22', 'Mateus', 21, '22', 'oracao'),
('Chegai-vos a Deus, e ele se chegará a vós.', 'Tiago 4:8a', 'Tiago', 4, '8', 'comunhao'),
('Porque onde estiverem dois ou três reunidos em meu nome, aí estou eu no meio deles.', 'Mateus 18:20', 'Mateus', 18, '20', 'comunhao'),

-- Promessas e Fidelidade
('Porque todas quantas promessas há de Deus, são nele sim, e por ele o Amém, para glória de Deus por nós.', '2 Coríntios 1:20', '2 Coríntios', 1, '20', 'promessas'),
('Fiel é o que vos chama, o qual também o fará.', '1 Tessalonicenses 5:24', '1 Tessalonicenses', 5, '24', 'fidelidade'),
('Jesus Cristo é o mesmo, ontem, e hoje, e eternamente.', 'Hebreus 13:8', 'Hebreus', 13, '8', 'fidelidade'),
('A tua palavra, SENHOR, permanece para sempre nos céus.', 'Salmos 119:89', 'Salmos', 119, '89', 'palavra'),

-- Novos Versículos Adicionais
('Mas os que esperam no SENHOR renovarão as forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.', 'Isaías 40:31', 'Isaías', 40, '31', 'esperanca'),
('Porque nada é impossível a Deus.', 'Lucas 1:37', 'Lucas', 1, '37', 'fe'),
('Grande é o SENHOR, e muito digno de louvor, na cidade do nosso Deus, no monte da sua santidade.', 'Salmos 48:1', 'Salmos', 48, '1', 'louvor'),
('O SENHOR te abençoe e te guarde; O SENHOR faça resplandecer o seu rosto sobre ti, e tenha misericórdia de ti.', 'Números 6:24-25', 'Números', 6, '24-25', 'bencao'),
('Porque a palavra de Deus é viva e eficaz, e mais penetrante do que espada alguma de dois gumes.', 'Hebreus 4:12', 'Hebreus', 4, '12', 'palavra'),
('Todas as coisas me são lícitas, mas nem todas as coisas convêm.', '1 Coríntios 6:12a', '1 Coríntios', 6, '12', 'sabedoria'),
('Porque somos feitura sua, criados em Cristo Jesus para as boas obras.', 'Efésios 2:10a', 'Efésios', 2, '10', 'proposito'),
('Pelo que estou certo de que, nem a morte, nem a vida, nem os anjos, nem os principados, nem as potestades, nem o presente, nem o porvir, nem a altura, nem a profundidade, nem alguma outra criatura nos poderá separar do amor de Deus.', 'Romanos 8:38-39', 'Romanos', 8, '38-39', 'amor'),
('Antes santificai ao Senhor Deus em vossos corações; e estai sempre preparados para responder com mansidão e temor a qualquer que vos pedir a razão da esperança que há em vós.', '1 Pedro 3:15', '1 Pedro', 3, '15', 'testemunho'),
('Bem-aventurados os que têm fome e sede de justiça, porque eles serão fartos.', 'Mateus 5:6', 'Mateus', 5, '6', 'justica'),
('Bem-aventurados os misericordiosos, porque eles alcançarão misericórdia.', 'Mateus 5:7', 'Mateus', 5, '7', 'misericordia'),
('Bem-aventurados os limpos de coração, porque eles verão a Deus.', 'Mateus 5:8', 'Mateus', 5, '8', 'pureza'),
('Bem-aventurados os pacificadores, porque eles serão chamados filhos de Deus.', 'Mateus 5:9', 'Mateus', 5, '9', 'paz'),
('Não se turbe o vosso coração; credes em Deus, crede também em mim.', 'João 14:1', 'João', 14, '1', 'fe'),
('Na casa de meu Pai há muitas moradas; se não fosse assim, eu vo-lo teria dito. Vou preparar-vos lugar.', 'João 14:2', 'João', 14, '2', 'esperanca'),
('Eu sou o caminho, e a verdade e a vida; ninguém vem ao Pai, senão por mim.', 'João 14:6', 'João', 14, '6', 'salvacao'),
('Se vós estiverdes em mim, e as minhas palavras estiverem em vós, pedireis tudo o que quiserdes, e vos será feito.', 'João 15:7', 'João', 15, '7', 'oracao'),
('Nisto é glorificado meu Pai, que deis muito fruto; e assim sereis meus discípulos.', 'João 15:8', 'João', 15, '8', 'fruto'),
('Como o Pai me amou, também eu vos amei; permanecei no meu amor.', 'João 15:9', 'João', 15, '9', 'amor'),
('Não fostes vós que me escolhestes a mim; mas eu vos escolhi a vós, e vos nomeei, para que vades e deis fruto.', 'João 15:16a', 'João', 15, '16', 'chamado'),
('Maior amor do que este ninguém tem, que é dar alguém a sua vida pelos seus amigos.', 'João 15:13', 'João', 15, '13', 'amor'),
('Estas coisas vos tenho dito, para que em mim tenhais paz; no mundo tereis aflições, mas tende bom ânimo, eu venci o mundo.', 'João 16:33', 'João', 16, '33', 'vitoria'),
('Mas o Consolador, o Espírito Santo, que o Pai enviará em meu nome, esse vos ensinará todas as coisas.', 'João 14:26a', 'João', 14, '26', 'espirito_santo'),
('Mas recebereis a virtude do Espírito Santo, que há de vir sobre vós; e ser-me-eis testemunhas.', 'Atos 1:8a', 'Atos', 1, '8', 'testemunho'),
('E eis que eu estou convosco todos os dias, até a consumação dos séculos.', 'Mateus 28:20b', 'Mateus', 28, '20', 'presenca'),
('Porque onde está o vosso tesouro, aí estará também o vosso coração.', 'Mateus 6:21', 'Mateus', 6, '21', 'prioridades'),
('Mas buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.', 'Mateus 6:33', 'Mateus', 6, '33', 'prioridades'),
('Vigiai e orai, para que não entreis em tentação; na verdade, o espírito está pronto, mas a carne é fraca.', 'Mateus 26:41', 'Mateus', 26, '41', 'vigilancia'),
('Sede sóbrios; vigiai; porque o diabo, vosso adversário, anda em derredor, bramando como leão, buscando a quem possa tragar.', '1 Pedro 5:8', '1 Pedro', 5, '8', 'vigilancia'),
('Sujeitai-vos, pois, a Deus; resisti ao diabo, e ele fugirá de vós.', 'Tiago 4:7', 'Tiago', 4, '7', 'resistencia'),
('Porque nossa luta não é contra carne e sangue, mas contra os principados, contra as potestades.', 'Efésios 6:12a', 'Efésios', 6, '12', 'guerra_espiritual'),
('Fortalecei-vos no Senhor e na força do seu poder.', 'Efésios 6:10', 'Efésios', 6, '10', 'forca'),
('Tomai toda a armadura de Deus, para que possais resistir no dia mau e, havendo feito tudo, ficar firmes.', 'Efésios 6:13', 'Efésios', 6, '13', 'armadura'),
('Portanto, meus amados irmãos, sede firmes e constantes, sempre abundantes na obra do Senhor.', '1 Coríntios 15:58a', '1 Coríntios', 15, '58', 'perseveranca'),
('Combati o bom combate, acabei a carreira, guardei a fé.', '2 Timóteo 4:7', '2 Timóteo', 4, '7', 'perseveranca'),
('Seja a vossa palavra: Sim, sim; Não, não; porque o que passa disto é de procedência maligna.', 'Mateus 5:37', 'Mateus', 5, '37', 'integridade'),
('Finalmente, irmãos, tudo o que é verdadeiro, tudo o que é honesto, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, se há alguma virtude, e se há algum louvor, nisso pensai.', 'Filipenses 4:8', 'Filipenses', 4, '8', 'pensamentos'),
('O justo florescerá como a palmeira; crescerá como o cedro no Líbano.', 'Salmos 92:12', 'Salmos', 92, '12', 'crescimento'),
('Porque aos seus anjos dará ordem a teu respeito, para te guardarem em todos os teus caminhos.', 'Salmos 91:11', 'Salmos', 91, '11', 'protecao'),
('Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.', 'Salmos 91:1', 'Salmos', 91, '1', 'protecao'),
('Mil cairão ao teu lado, e dez mil à tua direita, mas tu não serás atingido.', 'Salmos 91:7', 'Salmos', 91, '7', 'protecao'),
('Invoca-me no dia da angústia; eu te livrarei, e tu me glorificarás.', 'Salmos 50:15', 'Salmos', 50, '15', 'socorro'),
('O SENHOR está perto dos que têm o coração quebrantado, e salva os contritos de espírito.', 'Salmos 34:18', 'Salmos', 34, '18', 'consolo'),
('Provai, e vede que o SENHOR é bom; bem-aventurado o homem que nele confia.', 'Salmos 34:8', 'Salmos', 34, '8', 'bondade'),
('Os leõezinhos necessitam e sofrem fome, mas aqueles que buscam ao SENHOR não têm falta de coisa alguma que seja boa.', 'Salmos 34:10', 'Salmos', 34, '10', 'provisao'),
('Deleita-te também no SENHOR, e te concederá os desejos do teu coração.', 'Salmos 37:4', 'Salmos', 37, '4', 'desejo'),
('Descansa no SENHOR, e espera nele; não te indignes por causa do que prospera em seu caminho.', 'Salmos 37:7a', 'Salmos', 37, '7', 'descanso'),
('Porque ainda um pouquinho de tempo, e o ímpio não existirá; olharás para o seu lugar, e não aparecerá.', 'Salmos 37:10', 'Salmos', 37, '10', 'justica'),
('Mas os mansos herdarão a terra, e se deleitarão na abundância de paz.', 'Salmos 37:11', 'Salmos', 37, '11', 'mansidao'),
('O SENHOR conhece os dias dos retos, e a sua herança permanecerá para sempre.', 'Salmos 37:18', 'Salmos', 37, '18', 'heranca'),
('Fui moço, e agora sou velho; mas nunca vi desamparado o justo, nem a sua descendência a mendigar o pão.', 'Salmos 37:25', 'Salmos', 37, '25', 'providencia'),
('Aparta-te do mal e faze o bem; habita para sempre.', 'Salmos 37:27', 'Salmos', 37, '27', 'retidao'),
('A salvação dos justos vem do SENHOR; ele é a sua fortaleza no tempo da angústia.', 'Salmos 37:39', 'Salmos', 37, '39', 'salvacao'),
('Como suspira a corça pelas correntes das águas, assim suspira a minha alma por ti, ó Deus!', 'Salmos 42:1', 'Salmos', 42, '1', 'sede_deus'),
('A minha alma tem sede de Deus, do Deus vivo; quando entrarei e me apresentarei ante a face de Deus?', 'Salmos 42:2', 'Salmos', 42, '2', 'sede_deus'),
('Por que estás abatida, ó minha alma, e por que te perturbas em mim? Espera em Deus, pois ainda o louvarei na salvação da sua presença.', 'Salmos 42:5', 'Salmos', 42, '5', 'esperanca'),
('Assim como o Pai me enviou, também eu vos envio a vós.', 'João 20:21b', 'João', 20, '21', 'missao'),
('Ide por todo o mundo, pregai o evangelho a toda criatura.', 'Marcos 16:15', 'Marcos', 16, '15', 'evangelismo'),
('Portanto ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo.', 'Mateus 28:19', 'Mateus', 28, '19', 'discipulado'),
('A seara é realmente grande, mas poucos os ceifeiros.', 'Mateus 9:37b', 'Mateus', 9, '37', 'missao'),
('Rogai, pois, ao Senhor da seara, que mande ceifeiros para a sua seara.', 'Mateus 9:38', 'Mateus', 9, '38', 'oracao'),
('Mas como invocarão aquele em quem não creram? E como crerão naquele de quem não ouviram? E como ouvirão, se não há quem pregue?', 'Romanos 10:14', 'Romanos', 10, '14', 'pregacao'),
('E como pregarão, se não forem enviados? Como está escrito: Quão formosos os pés dos que anunciam a paz, dos que trazem alegres novas de boas coisas!', 'Romanos 10:15', 'Romanos', 10, '15', 'evangelismo'),
('Assim, a fé é pelo ouvir, e o ouvir pela palavra de Deus.', 'Romanos 10:17', 'Romanos', 10, '17', 'fe'),
('Porque não me envergonho do evangelho de Cristo, pois é o poder de Deus para salvação de todo aquele que crê.', 'Romanos 1:16a', 'Romanos', 1, '16', 'evangelho'),
('Porque a palavra da cruz é loucura para os que perecem; mas para nós, que somos salvos, é o poder de Deus.', '1 Coríntios 1:18', '1 Coríntios', 1, '18', 'cruz'),
('Mas nós pregamos a Cristo crucificado, que é escândalo para os judeus, e loucura para os gregos.', '1 Coríntios 1:23', '1 Coríntios', 1, '23', 'cristo'),
('Mas para os que são chamados, tanto judeus como gregos, lhes pregamos a Cristo, poder de Deus, e sabedoria de Deus.', '1 Coríntios 1:24', '1 Coríntios', 1, '24', 'sabedoria'),
('Porque as coisas loucas deste mundo escolheu Deus para confundir as sábias; e as coisas fracas deste mundo escolheu Deus para confundir as fortes.', '1 Coríntios 1:27', '1 Coríntios', 1, '27', 'escolha'),
('Para que a vossa fé não se apoiasse em sabedoria dos homens, mas no poder de Deus.', '1 Coríntios 2:5', '1 Coríntios', 2, '5', 'fe'),
('Mas, como está escrito: As coisas que o olho não viu, e o ouvido não ouviu, e não subiram ao coração do homem, são as que Deus preparou para os que o amam.', '1 Coríntios 2:9', '1 Coríntios', 2, '9', 'preparacao'),
('Porque quem dentre os homens sabe as coisas do homem, senão o espírito do homem, que nele está? Assim também ninguém sabe as coisas de Deus, senão o Espírito de Deus.', '1 Coríntios 2:11', '1 Coríntios', 2, '11', 'revelacao'),
('Ora, nós não recebemos o espírito do mundo, mas o Espírito que provém de Deus, para que pudéssemos conhecer o que nos é dado gratuitamente por Deus.', '1 Coríntios 2:12', '1 Coríntios', 2, '12', 'espirito_santo'),
('Ó profundidade das riquezas, tanto da sabedoria, como da ciência de Deus! Quão insondáveis são os seus juízos, e quão inescrutáveis os seus caminhos!', 'Romanos 11:33', 'Romanos', 11, '33', 'majestade'),
('Porque dele e por ele, e para ele, são todas as coisas; glória, pois, a ele eternamente. Amém.', 'Romanos 11:36', 'Romanos', 11, '36', 'gloria'),
('Rogo-vos, pois, irmãos, pela compaixão de Deus, que apresenteis os vossos corpos em sacrifício vivo, santo e agradável a Deus, que é o vosso culto racional.', 'Romanos 12:1', 'Romanos', 12, '1', 'consagracao'),
('E não sede conformados com este mundo, mas sede transformados pela renovação do vosso entendimento.', 'Romanos 12:2a', 'Romanos', 12, '2', 'transformacao');

-- Índices para melhor performance
CREATE INDEX idx_daily_verses_active ON public.daily_verses (is_active) WHERE is_active = true;
CREATE INDEX idx_daily_verses_category ON public.daily_verses (category);
CREATE INDEX idx_daily_verses_book ON public.daily_verses (book_name);