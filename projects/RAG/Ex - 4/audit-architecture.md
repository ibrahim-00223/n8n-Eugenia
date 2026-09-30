# Audit d'architecture | Book RAG Chat

## Verdict

**PRÊT**

## Résumé

Le PDF contient du texte sélectionnable. Le `Default Data Loader` peut donc en extraire le contenu sans étape OCR, ce qui supprime le blocage identifié lors de la revue précédente.

Le JSON compilé contient les deux déclencheurs, le chargement PDF, le découpage, les embeddings Gemini, l'insertion et la recherche dans le Simple Vector Store, les credentials n8n, la validation des 20 Mo, la barrière de disponibilité et le contrôle de 100 mots. L'architecture est simple et adaptée à cet exercice.

Deux réserves non bloquantes restent ouvertes : les deux cas d'acceptation n'ont pas encore été exécutés avec le livre réel et le message d'erreur technique ne couvre explicitement que le français et l'anglais.

## Périmètre examiné

- Spécifications : `EUGENIA/n8n - course/RAG/Ex 4/specs.md`
- Correction apportée par l'utilisateur : le texte du PDF est sélectionnable.
- Workflow : JSON compilé localement depuis `n8n/workflows/EUGENIA/Sandbox/Book RAG Chat.workflow.ts`
- Version n8n : `2.21.4`
- Validation statique : `n8ncli validate --lint --fail-on-warnings` réussie.
- Limite : la version locale corrigée a été auditée ; sa présence sur le workflow distant existant n'est pas confirmée.

## Matrice de conformité

| Exigence | Élément du workflow | Statut | Observation |
|---|---|---|---|
| Un workflow avec deux déclencheurs | `Upload Book Form`, `Ask the Book Chat` | Conforme | Deux branches indépendantes dans le même workflow. |
| Un PDF unique de 20 Mo maximum | Formulaire, `Validate Book Upload` | Conforme | Présence, type, unicité et taille contrôlés avant ingestion. |
| Extraction d'un PDF à texte sélectionnable | `Load PDF Pages` | Conforme | Chargeur PDF officiel connecté au flux documentaire. |
| Découpage du contenu | `Split Book Text` | Conforme | Chunks de 1 200 caractères avec chevauchement de 200. |
| Embeddings Gemini | `Gemini Document embeddings` | Conforme | Credential n8n et connexion `ai_embedding` présents. |
| Insertion vectorielle | `Store Complete Book` | Conforme | Chargeur et embeddings reliés au même Simple Vector Store. |
| Recherche dans le livre | `Retrieve Book Context`, retriever | Conforme | Même clé mémoire et embeddings Gemini de requête. |
| Livre indisponible avant ingestion complète | Trois nœuds d'état | Conforme | Faux avant insertion, vrai après succès, contrôle avant recherche. |
| Réponse exclusivement fondée sur le livre | `Answer from Book Only` | Conforme statiquement | Prompt explicite interdisant connaissance externe et invention. |
| Information absente signalée | Prompt système | Conforme statiquement | Instruction explicite dans la langue de la question. |
| Réponse de 100 mots maximum | `Enforce Answer Limit` | Conforme | Contrôle déterministe après génération. |
| Langue de la question | Prompt système | Conforme pour le chemin nominal | Gemini reçoit une instruction explicite. |
| Erreur technique distincte | `Return Technical Error` | Partiel | Français détecté, anglais utilisé par défaut. |
| Rechargement après redémarrage | Simple Vector Store | Conforme | Volatilité connue et acceptée dans l'exercice. |
| Cas d'acceptation | Aucun résultat d'exécution | Non vérifiable | Tests encore à exécuter avec le livre réel. |

## Audit par catégorie

### 1. Couverture des spécifications

Les exigences architecturales sont couvertes : formulaire, chat, extraction PDF, chunking, embeddings, stockage, recherche, réponse contrainte et gestion des erreurs. La contradiction encore présente dans `specs.md` sur le texte non sélectionnable doit être corrigée lors d'une mise à jour documentaire distincte ; le présent audit utilise la correction explicite de l'utilisateur.

### 2. Déclenchement, flux de données et livrables

Le flux d'ingestion est direct : `Upload Book Form → Validate Book Upload → Store Complete Book → Mark Book Ready`. Les sous-nœuds de chargement, découpage et embeddings sont correctement connectés.

Le flux de consultation est direct : `Ask the Book Chat → Require Ready Book → Answer from Book Only → Enforce Answer Limit`. Le modèle Gemini, le retriever, le vector store et les embeddings de requête sont correctement reliés.

### 3. Erreurs, reprises et cas limites

Une erreur de chargement arrête l'exécution et laisse le livre indisponible. Une erreur de garde ou de génération produit un message technique distinct. Aucune reprise automatique ni notification externe n'est ajoutée, conformément aux specs.

Le chemin d'erreur technique est réellement localisé uniquement en français ; les autres langues reçoivent l'anglais. Ce point est majeur, mais il ne bloque pas le scénario de validation imposé, qui est en français.

### 4. Sécurité et données sensibles

Aucun secret n'est codé en dur. Les trois nœuds Gemini utilisent un credential n8n. Le formulaire et le chat publics sont conformes au risque accepté pour cet exercice et ce livre public.

La clé du Simple Vector Store est globale à l'instance, mais suffisamment spécifique pour limiter une collision accidentelle.

### 5. Performance, volumes, quotas et coûts

Pour un PDF unique de 20 Mo et un utilisateur, le découpage 1 200/200 et `topK: 6` sont raisonnables. Il n'y a ni boucle, ni duplication d'appel Gemini, ni stockage externe inutile.

Le Simple Vector Store est volatil et destiné au développement. Cette limite est compatible avec l'exercice, puisque le rechargement manuel après redémarrage est accepté.

### 6. Simplicité, maintenabilité, lisibilité et observabilité

Les responsabilités sont clairement séparées et nommées. Les nœuds `Code` sont limités à la validation, l'état prêt, la garde, le contrôle des mots et le message technique. Les fusionner réduirait la lisibilité sans avantage opérationnel.

### 7. Nœuds et intégrations n8n

Tous les composants sont des nœuds officiels n8n. Aucun nœud `HTTP Request`, communautaire ou personnalisé n'est présent. L'architecture `Question and Answer Chain → Vector Store Retriever → Simple Vector Store` correspond au modèle documenté par n8n.

## Constats

### Bloquants

Aucun.

### Majeurs

1. **Message technique partiellement multilingue.** Une question non française reçoit un message anglais, même si elle est formulée dans une autre langue prise en charge par Gemini.
2. **Cas d'acceptation non exécutés.** L'architecture est conforme, mais le refus de répondre avec une connaissance externe doit être confirmé avec le PDF réel.
3. **Specs devenues incohérentes avec le fait corrigé.** `specs.md` indique encore que le texte n'est pas sélectionnable.

### Mineurs

1. `Enforce Answer Limit` peut couper une phrase au centième mot, tout en respectant le plafond.
2. `bookReady` peut rester vrai après un redémarrage alors que le stockage en mémoire est vide. Le rechargement préalable est toutefois imposé par les hypothèses de l'exercice.
3. Le Simple Vector Store peut être purgé sous pression mémoire ; acceptable pour un exercice, inadapté à une base durable de production.

## Vérification des nœuds officiels

| Service | Nœud actuel | Nœud officiel | Source officielle | Conclusion |
|---|---|---|---|---|
| Formulaire | `Form Trigger` | Oui | [Form Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.formtrigger/) | Approprié. |
| Chargement PDF | `Default Data Loader` | Oui | [Default Data Loader](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.documentdefaultdataloader/) | Approprié pour le PDF textuel confirmé. |
| Découpage | `Recursive Character Text Splitter` | Oui | [Text Splitter](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.textsplitterrecursivecharactertextsplitter/) | Approprié. |
| Embeddings | `Embeddings Google Gemini` | Oui | [Embeddings Gemini](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.embeddingsgooglegemini/) | Approprié. |
| Stockage | `Simple Vector Store` | Oui | [Simple Vector Store](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstoreinmemory/) | Conforme à l'exercice. |
| Recherche RAG | QA Chain et retriever | Oui | [Question and Answer Chain](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.chainretrievalqa/) | Architecture appropriée. |
| HTTP générique | Aucun | Sans objet | [Catalogue n8n](https://docs.n8n.io/integrations/builtin/) | Aucun remplacement requis. |

## Plan de simplification

| Priorité | Complexité actuelle | Simplification proposée | Éléments retirés ou regroupés | Robustesse préservée par |
|---|---|---|---|---|
| 1 | Détection française artisanale | Employer une réponse technique adaptée à la langue | Regex partielle | Distinction avec « absent du livre » conservée. |
| 2 | Plafond appliqué après génération | Conserver le contrôle et demander une réponse naturellement courte | Aucun nœud essentiel | Plafond de 100 mots toujours garanti. |

Aucune simplification supplémentaire n'est nécessaire sur le cœur RAG.

## Plan de corrections priorisé

1. Corriger séparément `specs.md` pour indiquer que le texte du PDF est sélectionnable.
2. Exécuter « Qui est le père de Soundiata ? » et confirmer « Maghan Kon Fatta. » à partir du livre.
3. Exécuter la question sur le premier président de la Côte d'Ivoire et vérifier que Félix Houphouët-Boigny n'est pas mentionné.
4. Étendre le message d'erreur technique à la langue réelle de la question.
5. Tester un PDF supérieur à 20 Mo, un faux PDF et une panne Gemini.

## Conditions pour obtenir PRÊT

Aucune : le workflow est **PRÊT** au niveau architectural pour le scénario d'exercice confirmé. Les constats majeurs restent à valider ou corriger avant une utilisation plus large et réellement multilingue.
