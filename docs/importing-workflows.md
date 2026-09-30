# Importer un workflow n8n

## Depuis un fichier

1. Ouvrir n8n.
2. Créer ou ouvrir l'espace dans lequel importer le workflow.
3. Choisir l'option d'import depuis un fichier.
4. Sélectionner le fichier `workflow.json` souhaité.
5. Enregistrer le workflow importé.

## Après l'import

- Configurer ses propres credentials dans chaque intégration concernée.
- Contrôler les URL, identifiants, canaux, adresses et valeurs propres à l'environnement d'origine.
- Vérifier que les données d'exemple ne contiennent aucune information personnelle.
- Exécuter manuellement le workflow avec des données de test.
- Vérifier les sorties, les erreurs et les éventuelles opérations irréversibles.
- N'activer le déclencheur automatique qu'après validation.

## Important

Les exports de ce dépôt ne doivent contenir aucun secret. Les références de credentials présentes dans un workflow importé ne donnent pas accès aux comptes de son auteur : chaque utilisateur doit fournir ses propres accès.
