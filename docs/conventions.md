# Conventions du dépôt

## Nommage

- Utiliser des noms en minuscules séparés par des tirets : `notification-slack`.
- Donner aux workflows des noms décrivant clairement leur résultat.
- Éviter les noms génériques comme `test`, `workflow-1` ou `final-v2`.

## Structure d'un projet

```text
projects/nom-du-projet/
├── README.md
├── specs.md
├── workflow.json
└── assets/
```

## Structure d'un template

```text
templates/nom-du-template/
├── README.md
├── workflow.json
└── example.env
```

## Documentation minimale

Le `README.md` d'un projet ou template doit indiquer :

- son objectif ;
- son déclencheur ;
- son résultat attendu ;
- les outils et comptes requis ;
- les variables à personnaliser ;
- la procédure de test ;
- les limites ou risques connus.

## Secrets et données

- Ne jamais versionner de credentials ni de secrets.
- Utiliser des données fictives dans les exemples.
- Retirer les données personnelles des exports et captures.
- Fournir un fichier `example.env` sans aucune valeur secrète lorsque des variables sont nécessaires.
