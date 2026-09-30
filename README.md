# n8n — Eugenia

Ce dépôt accompagne mon cours consacré à **n8n**. Il centralise les ressources développées pendant la formation : skills pour assistants IA, projets d'automatisation complets et templates de workflows réutilisables.

## Contenu du dépôt

```text
n8n-Eugenia/
├── skills/       Skills et instructions pour assistants IA
├── projects/     Projets d'automatisation complets
├── templates/    Workflows génériques à copier et adapter
└── docs/         Guides et conventions du dépôt
```

### Skills

Le dossier [`skills`](skills/) contient des compétences réutilisables par un assistant compatible avec le format `SKILL.md`.

- [`n8n-interview`](skills/n8n-interview/) : conduit un entretien de cadrage et produit les spécifications fonctionnelles d'un projet n8n avant sa conception technique.
- [`n8n-specs-review`](skills/n8n-specs-review/) : challenge les spécifications par un entretien contradictoire et rend un verdict `PRÊT` ou `PAS PRÊT`.
- [`n8n-architecture-review`](skills/n8n-architecture-review/) : compare un workflow JSON aux spécifications validées, audite son architecture technique et rend un verdict `PRÊT` ou `À REVOIR` accompagné d'un plan de corrections.

### Projets

Le dossier [`projects`](projects/) accueille les automatisations réalisées dans le cadre du cours. Chaque projet pourra contenir :

- un `README.md` présentant le besoin et l'utilisation ;
- les spécifications fonctionnelles dans `specs.md` ;
- le workflow exporté dans `workflow.json` ;
- les ressources complémentaires dans `assets/`.

### Templates

Le dossier [`templates`](templates/) contient des workflows génériques conçus pour être copiés et adaptés. Chaque template doit documenter son objectif, ses prérequis, ses entrées, ses sorties et les credentials à configurer.

## Récupérer le dépôt

### Avec Git

```bash
git clone https://github.com/ibrahim-00223/n8n-Eugenia.git
cd n8n-Eugenia
```

Pour récupérer les nouveautés ultérieurement :

```bash
git pull
```

### Sans Git

Depuis la page GitHub du dépôt :

1. cliquer sur **Code** ;
2. choisir **Download ZIP** ;
3. extraire l'archive sur son ordinateur.

## Utiliser un workflow dans n8n

1. Télécharger ou cloner ce dépôt.
2. Choisir un fichier `workflow.json` dans `projects/` ou `templates/`.
3. Ouvrir n8n et créer un nouveau workflow.
4. Utiliser l'option d'import depuis un fichier.
5. Sélectionner le fichier JSON.
6. Configurer ses propres credentials avant le premier test.
7. Vérifier le comportement du workflow dans un environnement de test avant de l'activer.

Consulter le guide détaillé : [`docs/importing-workflows.md`](docs/importing-workflows.md).

## Utiliser un skill

Chaque skill possède son propre fichier `SKILL.md`. Pour `n8n-interview`, copier le dossier complet dans le répertoire de skills de l'outil compatible :

```bash
cp -R skills/n8n-interview ~/.codex/skills/
```

Le chemin peut varier selon l'assistant utilisé. Consulter sa documentation avant l'installation.

## Sécurité

- Ne jamais publier de mot de passe, token, clé API ou cookie.
- Ne pas ajouter de fichier `.env` réel au dépôt.
- Utiliser `example.env` pour documenter uniquement les noms des variables nécessaires.
- Reconfigurer les credentials après l'import d'un workflow.
- Anonymiser les données personnelles présentes dans les exemples.

## Documentation

- [Bien démarrer](docs/getting-started.md)
- [Importer un workflow](docs/importing-workflows.md)
- [Conventions du dépôt](docs/conventions.md)

## Licence

Aucune licence de réutilisation n'a encore été choisie. Sauf mention contraire, la présence du code sur GitHub n'accorde pas automatiquement le droit de le réutiliser ou de le redistribuer.
