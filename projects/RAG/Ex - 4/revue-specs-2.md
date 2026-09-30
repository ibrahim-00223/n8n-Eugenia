# Revue des specs | Livre PDF et chat RAG

## Verdict

**PRÊT**

## Justification

Les spécifications sont suffisamment claires, cohérentes et testables pour commencer la conception. Le besoin, les deux déclencheurs, le périmètre des données, les résultats attendus et les comportements d'erreur sont définis. Les deux cas de validation permettent à une personne indépendante de vérifier la réponse fondée sur le livre et le refus d'utiliser les connaissances générales.

Les contraintes techniques mentionnées correspondent à des choix explicitement confirmés pour l'exercice. Les limites relatives au redémarrage, à l'accès, aux langues, aux coûts et aux délais sont connues et acceptées.

## Blocages

Aucun blocage identifié.

## Points à clarifier

Aucun point ne nécessite une décision supplémentaire avant la conception.

## Risques résiduels

- Le PDF doit être rechargé manuellement après un redémarrage de l'instance avant de reprendre le chat.
- Le formulaire et le chat ne disposent d'aucune protection d'accès ; ce risque est accepté pour cet exercice.
- La prise en charge de toutes les langues admises par Gemini n'est pas couverte par les tests ; seul le scénario en français est exigé.
- Aucun délai maximal ni aucune limite de coût ne sont fixés.
- Le deuxième chargement, la coexistence de plusieurs livres et l'utilisation du chat avant le chargement restent hors périmètre.
- Le PDF ne contient pas de texte sélectionnable ; les specs confirment toutefois que son contenu textuel est exploitable.

## Corrections à appliquer dans n8n-interview

Aucune correction obligatoire. Les spécifications peuvent passer à la conception en l'état.
