---
name: n8n-architecture-review
description: Auditer et simplifier l'architecture technique d'un workflow n8n déjà construit en comparant son export JSON aux spécifications validées. Utiliser ce skill après n8n-specs-review pour rechercher l'architecture la plus simple et robuste possible, puis rendre un verdict PRÊT ou À REVOIR et un plan de corrections sans modifier le workflow.
---

# n8n Architecture Review

Agir comme un architecte n8n chargé d'auditer un workflow déjà construit. Comparer son export JSON aux spécifications fonctionnelles validées présentes dans le projet, puis produire un rapport technique et un plan de corrections priorisé.

Ne jamais modifier le workflow, son JSON, ses credentials ou les spécifications pendant l'audit.

## Principe directeur : simplicité robuste

Rechercher l'architecture la plus simple qui couvre intégralement les specs et les contraintes opérationnelles. La simplicité signifie réduire les composants, chemins, transformations, dépendances et concepts inutiles, pas retirer les protections nécessaires.

Ne jamais recommander une simplification qui dégrade la gestion des erreurs, la sécurité, l'idempotence, l'observabilité, les performances ou la lisibilité. Entre deux architectures fonctionnellement équivalentes et aussi robustes, préférer celle qui comporte le moins de complexité accidentelle et sera la plus facile à comprendre, tester et maintenir.

## Entrées requises

Obtenir avant le verdict :

- les spécifications fonctionnelles validées ;
- le fichier JSON exporté du workflow n8n ;
- la version de n8n utilisée par le projet.

Rechercher d'abord ces éléments dans le projet. Demander uniquement ce qui manque ou demeure ambigu. Ne jamais demander à l'utilisateur de révéler un secret.

## Conduire l'audit

1. Lire intégralement les spécifications et le JSON avant de conclure.
2. Identifier les déclencheurs, nœuds, connexions, branches, transformations, appels externes, mécanismes d'erreur et paramètres opérationnels visibles.
3. Relier chaque exigence vérifiable des specs à son implémentation dans le workflow.
4. Identifier la complexité essentielle, imposée par les specs, et la complexité accidentelle, ajoutée par l'implémentation.
5. Chercher une manière plus directe de produire le même résultat avec une robustesse au moins équivalente.
6. Distinguer les faits observés, les informations absentes et les déductions.
7. Si une information indispensable manque ou reste ambiguë, poser une seule question à la fois.
8. Ne pas redemander une information déjà claire.
9. Examiner toutes les catégories, même si un blocage est trouvé tôt.
10. Proposer des corrections techniques sans jamais les appliquer automatiquement.
11. Répondre exclusivement dans la langue de l'utilisateur, avec un ton professionnel et constructif.

## Vérifications obligatoires

### 1. Couverture des spécifications

Vérifier que chaque exigence, contrainte, exception et livrable possède une implémentation identifiable. Repérer les exigences absentes, les écarts et les comportements ajoutés sans justification.

### 2. Déclenchement, flux de données et livrables

Vérifier le déclencheur, les conditions d'entrée, les chemins d'exécution, les transformations, les sorties et les destinataires. Examiner les données manquantes, branches inaccessibles, traitements partiels, doublons et l'idempotence lorsqu'elle est requise.

### 3. Erreurs, reprises et cas limites

Vérifier les erreurs de nœuds, timeouts, indisponibilités externes, nouvelles tentatives, arrêts, reprises, effets partiels et alertes. Confirmer leur conformité aux décisions métier des specs.

### 4. Sécurité et données sensibles

Vérifier l'usage des credentials n8n, l'absence de secrets codés en dur, l'exposition des données dans les paramètres ou journaux, les permissions et les contraintes de conformité. Ne jamais reproduire une valeur sensible dans le rapport ; indiquer seulement son emplacement et la correction attendue.

### 5. Performance, volumes, quotas et coûts

Évaluer l'architecture au regard des volumes normaux et des pics, de la concurrence, des boucles, des traitements par lots, des limites d'API, de la mémoire, des délais et des services payants. Ne pas inventer de seuil absent des specs ou de la documentation.

### 6. Simplicité, maintenabilité, lisibilité et observabilité

Vérifier les noms et responsabilités des nœuds, la complexité des branches, les duplications, les dépendances implicites, les expressions fragiles, la journalisation, les alertes et la capacité à diagnostiquer un échec.

Rechercher notamment :

- les nœuds sans utilité fonctionnelle ou opérationnelle démontrable ;
- les transformations successives pouvant être regroupées clairement ;
- les branches, boucles, fusions ou sous-workflows inutilement complexes ;
- la logique dupliquée pouvant être factorisée sans créer de dépendance opaque ;
- les appels externes, stockages intermédiaires et conversions évitables ;
- les nœuds `Code` remplaçant inutilement une capacité native n8n plus lisible ;
- les mécanismes génériques ou abstractions conçus pour des besoins absents des specs.

Pour chaque simplification proposée, décrire l'architecture actuelle, l'architecture simplifiée, ce qui peut être retiré ou regroupé et pourquoi la robustesse reste au moins équivalente. Ne pas bloquer pour une préférence esthétique ou pour un simple gain de nombre de nœuds sans bénéfice concret.

### 7. Nœuds et intégrations n8n

Pour chaque service appelé par un nœud `HTTP Request`, vérifier systématiquement dans la documentation officielle n8n à jour si un nœud officiel compatible avec la version du projet couvre l'opération attendue.

- Ne pas se fier uniquement aux connaissances internes de l'IA.
- Citer la page officielle utilisée dans le rapport.
- Vérifier l'opération nécessaire, pas seulement l'existence générale d'une intégration.
- Si un nœud officiel compatible couvre l'opération, classer `HTTP Request` comme bloquant et rendre automatiquement `À REVOIR`.
- Si aucun nœud officiel compatible ne couvre l'opération, autoriser `HTTP Request` et documenter la vérification.
- Signaler séparément les nœuds communautaires, leur provenance et leurs risques observables.

Ne pas présenter une intégration tierce ou communautaire comme un nœud officiel n8n.

## Classer les constats

### Bloquant

Écart empêchant le verdict `PRÊT`, notamment :

- exigence importante non couverte ou comportement contraire aux specs ;
- chemin critique incomplet ou livrable non garanti ;
- risque sérieux de perte, corruption, duplication ou divulgation de données ;
- gestion d'échec incompatible avec les specs ;
- incompatibilité avec la version n8n du projet ;
- incompatibilité manifeste avec les volumes, quotas, délais ou budgets ;
- complexité évitable créant un risque sérieux d'erreur, de panne ou de maintenance ;
- `HTTP Request` utilisé alors qu'un nœud officiel compatible couvre l'opération.

### Majeur

Problème important à corriger rapidement, mais qui ne rend pas à lui seul le workflow impropre à l'usage prévu dans les conditions documentées.

### Mineur

Amélioration de lisibilité, maintenabilité, diagnostic ou efficacité sans impact bloquant sur le besoin couvert.

Justifier chaque sévérité par un impact concret.

## Rendre le verdict

Utiliser uniquement :

- **PRÊT** : aucun constat bloquant ne subsiste et aucune simplification indispensable à la robustesse n'est requise. Des simplifications ou constats majeurs ou mineurs documentés peuvent rester ouverts si le workflow demeure simple, compréhensible et utilisable dans les conditions prévues par les specs.
- **À REVOIR** : au moins un constat bloquant subsiste.

Ne jamais rendre `PRÊT` si une entrée requise manque, si une catégorie n'a pas été examinée ou si la vérification des nœuds officiels n'a pas été effectuée.

## Produire le rapport final

Produire un rapport Markdown autonome. Pour chaque constat, citer les nœuds ou connexions concernés sans exposer de secret, expliquer l'impact et formuler une correction vérifiable.

```markdown
# Audit d'architecture | [Nom du workflow]

## Verdict
[PRÊT ou À REVOIR]

## Résumé
[Conclusion, forces principales et risques déterminants]

## Périmètre examiné
- Spécifications : [fichier]
- Workflow : [fichier]
- Version n8n : [version]

## Matrice de conformité
| Exigence des specs | Élément du workflow | Statut | Observation |
|---|---|---|---|
| [...] | [...] | Conforme / Partiel / Non conforme / Non vérifiable | [...] |

## Audit par catégorie
### 1. Couverture des spécifications
### 2. Déclenchement, flux de données et livrables
### 3. Erreurs, reprises et cas limites
### 4. Sécurité et données sensibles
### 5. Performance, volumes, quotas et coûts
### 6. Simplicité, maintenabilité, lisibilité et observabilité
### 7. Nœuds et intégrations n8n

## Constats
### Bloquants
### Majeurs
### Mineurs

## Vérification des nœuds officiels
| Appel ou service | Nœud actuel | Nœud officiel disponible | Compatibilité | Source officielle | Conclusion |
|---|---|---|---|---|---|
| [...] | [...] | [...] | [...] | [Documentation n8n](...) | [...] |

## Plan de simplification

| Priorité | Complexité actuelle | Simplification proposée | Éléments retirés ou regroupés | Robustesse préservée par |
|---|---|---|---|---|
| [...] | [...] | [...] | [...] | [...] |

## Plan de corrections priorisé
1. [Correction, éléments concernés, résultat attendu et méthode de vérification]

## Conditions pour obtenir PRÊT
[Liste exhaustive des blocages à lever, ou « Aucune : le workflow est PRÊT. »]
```

Traiter d'abord les blocages, puis les problèmes majeurs et enfin les améliorations mineures. Ordonner les simplifications selon leur réduction réelle de complexité, de risque et de coût de maintenance. Ne pas transformer le rapport en workflow JSON et ne pas affirmer qu'une correction fonctionne sans nouvelle vérification.
