# course-01

Premier cours sur les langages TypeScript et JavaScript.

## Pourquoi TypeScript / Javascript ?
Parce que le **JavaScript** est le langage des navigateurs internet et que ceux-ci sont extrémement optimisés pour faire tourner ce type langage interprété.

**TypeScript** est un langage de programmation libre et open source développé par Microsoft qui a pour but d'améliorer et de sécuriser la production de code JavaScript. Il s'agit d'un sur-ensemble syntaxique strict de JavaScript (c'est-à-dire que tout code JavaScript correct peut être utilisé avec TypeScript). Le code TypeScript est transcompilé en JavaScript, et peut ainsi être interprété par n'importe quel navigateur web ou moteur JavaScript. 

Ces langages ont une structure syntaxique (boucles, tests...) proche du langage C.
___

## Installation pour les développeurs
- [Visual studio code](https://code.visualstudio.com/): éditeur de code (js, c++, fortran, matlab...)
- [nodejs](https://nodejs.org/en/): pour faire tourner du JavaScript dans une console
- [yarn](https://yarnpkg.com/): cette commande va remplacer la commande "npm" de nodejs (plus pratique)
- [git](https://git-scm.com/): Git is free and open source software for distributed version control: tracking changes in any set of files, usually used for coordinating work among programmers collaboratively developing source code during software development.

___

## Usage
- `yarn` to install all the necessary packages before anything
- `yarn build` to build the lib
- `yarn test` too test the lib
- Go to the directory `examples` to run some examples
    - `node script.js`

___
<br><br><br>

## Notions préliminaires
- Comprendre et utiliser l'utilitaire `yarn`
- Comprendre et utiliser l'utilitaire `node`
- Faire ses premiers `unit test`
- Faire du `coverage` de code
- Ecrire et générer de la `documentation` pour les utilisateurs
- Ecrire et générer une librarie
- Ecrire des examples utilisant cette librairie

## Notions de base
- Comprendre ces langages (syntaxe)
    - Typage versus non-typage
    - Variables `const` et `let`
    - Plus de variables globales !
- Exporter le strict nécessaire pour l'utilisateur
- Comprendre et utiliser la programmation fonctionnelle (déclarative). Comparaison avec la programmation impérative
- Comprendre et utiliser les fonctions `arrow` (ou expression lambda en C++)
- Utiliser une librairie tierce
    - La librairie `@youwol/dataframe`
    - Comparaison avec la librairie `Panda` (Python)
    - Avantages à utiliser cette librairie
    - Dataframe et programmation fonctionnelle
- → Exemple 1: Comment calculer le vecteur moyen des vecteurs propres d'une suites de tenseurs de contraintes aléatoires

## Notions avancées
- Notion de programmation orientée objets
- Notion de classe
- Notion d'interface
- Le `constructor` et son rôle
- Notion sous-jacente de polymorphisme
- → Exemple 2: Comment; en une centaine de lignes de code, on peut faire de la dérivation numérique et symbolique de fonctions mathématiques à une variable
