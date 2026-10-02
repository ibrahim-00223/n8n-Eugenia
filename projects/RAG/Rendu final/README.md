# RAG Augmented

Ce workflow n8n permet de charger un livre au format PDF, d'en indexer le contenu dans Supabase, puis de poser des questions sur ce livre dans une interface de chat. Les réponses sont générées par Gemini uniquement à partir des passages retrouvés dans le document.

## Vue d'ensemble

Le workflow contient deux parcours indépendants :

1. **Ingestion du livre** : PDF → validation → extraction du texte → nettoyage → découpage → embeddings Gemini → stockage dans Supabase.
2. **Questions-réponses** : question → recherche des passages pertinents dans Supabase → réponse Gemini → réponse limitée à 100 mots.

```text
Formulaire PDF
  → Validation
  → Extraction et nettoyage du texte
  → Découpage en morceaux
  → Embeddings Gemini
  → Table Supabase "documents"

Chat public
  → Recherche des 6 passages les plus proches
  → Réponse Gemini fondée sur ces passages
  → Limitation à 100 mots
  → Affichage dans le chat
```

## Prérequis

- une instance n8n compatible avec les nœuds LangChain utilisés ;
- un compte Google Gemini et une clé API ;
- un projet Supabase avec l'extension vectorielle et une table `documents` ;
- une fonction RPC Supabase nommée `match_documents` ;
- les identifiants n8n suivants, ou des identifiants équivalents à sélectionner dans les nœuds :
  - `Google Gemini(PaLM) Api account` ;
  - `Supabase n8n RAG`.

Le workflow utilise le modèle de chat `models/gemini-3.1-flash-lite` et les embeddings Gemini. Vérifiez que ce modèle est disponible pour votre compte au moment de l'installation.

## Mise en route

1. Ouvrez ou importez `RAG Augmented.workflow.ts` dans le dépôt géré par `n8ncli`.
2. Dans n8n, vérifiez les credentials des nœuds Gemini et Supabase.
3. Vérifiez que la table `documents` et la fonction `match_documents` existent dans Supabase.
4. Ouvrez **Upload Book Form** et chargez un PDF public en anglais de 20 Mo maximum.
5. Attendez la fin complète de l'exécution. Le dernier nœud, **Mark Book Ready**, confirme que l'indexation est terminée.
6. Ouvrez **Ask the Book Chat**, puis posez une question portant sur le livre chargé.
7. Activez/publiez le workflow seulement après un test complet des deux parcours.

## Fonctionnement détaillé

### 1. Ingestion

- **Upload Book Form** expose un formulaire acceptant un seul fichier PDF.
- **Validate Book Upload** contrôle la présence du fichier, son format et la limite de 20 Mo. Il marque aussi le livre comme indisponible pendant l'ingestion.
- **Extract PDF Text** extrait le texte du PDF.
- **Clean Extracted Text** normalise le texte, retire certains caractères invisibles et conserve la structure des paragraphes.
- **Chunk Clean Text** crée des morceaux d'environ 1 200 caractères, avec jusqu'à 200 caractères de chevauchement.
- **Store Complete Book** génère les embeddings Gemini et insère les morceaux dans la table Supabase `documents`, avec leurs métadonnées.
- **Mark Book Ready** mémorise la fin réussie de l'indexation dans les données statiques du workflow.

### 2. Questions-réponses

- **Ask the Book Chat** reçoit la question de l'utilisateur dans un chat public.
- **Retrieve Book Context** vectorise la question et interroge `match_documents`.
- **Find Relevant Book Passages** récupère les 6 passages les plus proches.
- **Answer from Book Only** demande à Gemini de répondre uniquement avec ce contexte, dans la langue de la question, sans inventer d'information.
- **Enforce Answer Limit** limite mécaniquement la réponse à 100 mots.
- **Chat** renvoie le résultat à l'utilisateur.

## Tests conseillés

- Charger un petit PDF contenant une information facile à retrouver.
- Poser une question dont la réponse est explicitement présente dans le livre.
- Poser une question hors sujet : le chat doit indiquer que l'information n'est pas dans le livre.
- Tester le refus d'un fichier non PDF et d'un PDF supérieur à 20 Mo.
- Contrôler dans Supabase que les lignes contiennent bien `source`, `fileName`, `chunkIndex`, `chunkCount` et `ingestedAt`.

## Points d'attention

- Le workflow **n'efface pas les anciens documents** avant une nouvelle ingestion. Plusieurs livres peuvent donc s'accumuler dans la table et se mélanger lors de la recherche. Pour garantir un seul livre actif, videz les anciennes lignes ou ajoutez un identifiant de livre et un filtre de recherche.
- La variable statique `bookReady` est renseignée pendant l'ingestion, mais le parcours de chat ne la contrôle pas actuellement. Le chat peut donc être ouvert avant la fin de l'indexation.
- Le formulaire décrit le PDF comme public et anglais, mais le code ne vérifie ni les droits d'utilisation ni la langue du document.
- Un PDF scanné sans couche de texte nécessite une étape OCR, absente de cette version.
- Le chat est configuré comme public. Ne l'activez pas avec des documents sensibles sans ajouter les protections adaptées.
- Les credentials référencés dans le fichier sont des références n8n, pas les secrets eux-mêmes. Ils doivent exister ou être remappés sur l'instance cible.

## Fichier fourni

- `RAG Augmented.workflow.ts` : copie locale du workflow téléchargé depuis `EUGENIA/Projects/RAG/RAG Augmented`.
