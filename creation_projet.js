const fs = require('fs').promises;
const pathModule = require('path');
const readline = require('readline');

class ProjectGenerator {
    constructor() {
        this.currentDate = new Date().toISOString().split('T')[0];
        this.projectInfo = {};
        this.projectPath = '';
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Définition des styles et leurs descriptions
        this.styles = {
            1: { nom: 'Material Design', description: 'Design moderne et épuré suivant les principes de Google Material' },
            2: { nom: 'Minimalist', description: 'Design minimaliste mettant l\'accent sur la simplicité et la fonctionnalité' },
            3: { nom: 'Neomorphism', description: 'Style doux et moderne avec des effets d\'ombre subtils' },
            4: { nom: 'Retro/Vintage', description: 'Design rétro rappelant les interfaces des années 80-90' },
            5: { nom: 'Organic Design', description: 'Design fluide avec des formes organiques et naturelles' },
            6: { nom: 'Glassmorphism', description: 'Effet de verre dépoli avec flou d\'arrière-plan' },
            7: { nom: 'Brutalist', description: 'Design brut et audacieux avec des contrastes forts' },
            8: { nom: 'Cyberpunk', description: 'Style futuriste avec des néons et des effets high-tech' }
        };

        // Définition des frameworks et leurs descriptions
        this.frameworks = {
            1: { nom: 'Tailwind CSS', description: 'Framework utility-first pour un développement rapide' },
            2: { nom: 'Bootstrap 5', description: 'Framework CSS le plus populaire avec composants prêts à l\'emploi' },
            3: { nom: 'Bulma', description: 'Framework moderne basé sur Flexbox, sans JavaScript' },
            4: { nom: 'Foundation', description: 'Framework professionnel avec grille responsive avancée' },
            5: { nom: 'Custom CSS', description: 'CSS personnalisé pour un contrôle total du design' },
            6: { nom: 'Sass/SCSS', description: 'Préprocesseur CSS pour une meilleure organisation du code' },
            7: { nom: 'CSS Modules', description: 'Styles scopés par composant pour éviter les conflits' },
            8: { nom: 'Styled Components', description: 'CSS-in-JS pour des styles dynamiques en React' }
        };
    }

    async question(query) {
        return new Promise(resolve => this.rl.question(query, resolve));
    }

    async validerChoix(choix, min, max) {
        const num = parseInt(choix);
        return !isNaN(num) && num >= min && num <= max;
    }

    async demanderAvecValidation(question, min, max) {
        let choix;
        do {
            choix = await this.question(question);
            if (!await this.validerChoix(choix, min, max)) {
                console.log(`❌ Veuillez entrer un nombre entre ${min} et ${max}`);
            }
        } while (!await this.validerChoix(choix, min, max));
        return parseInt(choix);
    }

    async demanderInfosProjet() {
        try {
            console.log('\n📝 Configuration du projet');
            console.log('═'.repeat(50));

            // Informations de base
            do {
                this.projectInfo.nom = await this.question('📌 Nom du projet: ');
                if (!this.projectInfo.nom.trim()) {
                    console.log('❌ Le nom du projet ne peut pas être vide');
                }
            } while (!this.projectInfo.nom.trim());

            this.projectInfo.description = await this.question('📄 Description: ');
            this.projectInfo.auteur = await this.question('👤 Auteur: ');

            // Catégorie du projet
            console.log('\n📂 Catégories disponibles:');
            console.log('1. Web              - Applications web modernes et sites internet');
            console.log('2. Application Desktop - Applications natives pour Windows/Mac/Linux');
            console.log('3. API              - Services web et APIs RESTful');
            console.log('4. Bibliothèque     - Packages et bibliothèques réutilisables');
            console.log('5. Autre            - Autres types de projets');
            
            this.projectInfo.categorie = await this.demanderAvecValidation('Choisissez une catégorie (1-5): ', 1, 5);

            // Configuration spécifique pour les projets web
            if (this.projectInfo.categorie === 1) {
                // Affichage des styles et sélection
                console.log('\n🎨 Styles disponibles:');
                for (const [key, style] of Object.entries(this.styles)) {
                    console.log(`${key}. ${style.nom.padEnd(15)} - ${style.description}`);
                }
                const styleChoisi = await this.demanderAvecValidation('Choisissez un style (1-8): ', 1, 8);
                console.log(`✨ Style choisi: ${this.styles[styleChoisi].nom}\n`);

                // Affichage des frameworks et sélection
                console.log('🎯 Frameworks CSS disponibles:');
                for (const [key, framework] of Object.entries(this.frameworks)) {
                    console.log(`${key}. ${framework.nom.padEnd(15)} - ${framework.description}`);
                }
                const frameworkChoisi = await this.demanderAvecValidation('Choisissez un framework CSS (1-8): ', 1, 8);
                console.log(`📚 Framework choisi: ${this.frameworks[frameworkChoisi].nom}`);

                this.projectInfo.web = {
                    style: styleChoisi,
                    framework: frameworkChoisi,
                    styleNom: this.styles[styleChoisi].nom,
                    frameworkNom: this.frameworks[frameworkChoisi].nom
                };
            }

            console.log('\n✅ Configuration terminée !');
            this.rl.close();
            return true;
        } catch (error) {
            console.error(`❌ Erreur lors de la configuration: ${error.message}`);
            this.rl.close();
            return false;
        }
    }

    async creerFichierPrincipal(basePath) {
        try {
            const contenu = `// Fichier principal généré le ${this.currentDate}
// Projet: ${this.projectInfo.nom || ''}
// Auteur: ${this.projectInfo.auteur || ''}

console.log("Démarrage du projet ${this.projectInfo.nom || ''}");\n`;

            await fs.writeFile(pathModule.join(basePath, 'src', 'index.js'), contenu);
            return true;
        } catch (error) {
            console.error(`❌ Erreur lors de la création du fichier principal: ${error.message}`);
            return false;
        }
    }

    async genererReadme(basePath) {
        try {
            let categorie = '';
            switch (this.projectInfo.categorie) {
                case 1: categorie = 'Application Web'; break;
                case 2: categorie = 'Application Desktop'; break;
                case 3: categorie = 'API'; break;
                case 4: categorie = 'Bibliothèque'; break;
                case 5: categorie = 'Autre'; break;
            }

            let technologiesSection = '';
            if (this.projectInfo.categorie === 1) {
                technologiesSection = `
## 🎨 Design & Technologies

- **Style**: ${this.projectInfo.web.styleNom} - ${this.styles[this.projectInfo.web.style].description}
- **Framework CSS**: ${this.projectInfo.web.frameworkNom} - ${this.frameworks[this.projectInfo.web.framework].description}`;
            }

            const readme = `# ${this.projectInfo.nom}

## 📝 Description
${this.projectInfo.description || 'Aucune description fournie'}

## 🚀 Type de Projet
${categorie}${technologiesSection}

## 🛠️ Installation
1. Clonez ce dépôt
\`\`\`bash
git clone [url-du-projet]
cd ${this.projectInfo.nom}
\`\`\`

2. Installez les dépendances
\`\`\`bash
npm install
\`\`\`

## 📖 Utilisation
\`\`\`bash
npm start
\`\`\`

## 👤 Auteur
${this.projectInfo.auteur || 'Non spécifié'}

## 📅 Date de création
${this.currentDate}

## 📄 Licence
MIT
`;
            await fs.writeFile(pathModule.join(basePath, 'README.md'), readme);
            return true;
        } catch (error) {
            console.error(`❌ Erreur lors de la création du README: ${error.message}`);
            return false;
        }
    }

    async creerStructureDossiers() {
        try {
            // Créer le dossier principal du projet s'il n'existe pas
            await fs.mkdir(this.projectPath, { recursive: true });

            // Structure de base commune à tous les projets
            const dossiers = [
                'src',
                'docs',
                'tests',
                'config'
            ];

            // Ajouter des dossiers spécifiques selon la catégorie
            if (this.projectInfo.categorie === 1) { // Web
                dossiers.push(
                    'src/assets',
                    'src/assets/images',
                    'src/assets/styles',
                    'src/assets/scripts',
                    'src/components',
                    'src/layouts'
                );
            }

            // Créer tous les dossiers
            for (const dossier of dossiers) {
                const cheminDossier = pathModule.join(this.projectPath, dossier);
                await fs.mkdir(cheminDossier, { recursive: true });
            }

            return true;
        } catch (error) {
            console.error(`❌ Erreur lors de la création des dossiers: ${error.message}`);
            return false;
        }
    }

    async genererProjet() {
        try {
            // Demander les informations
            await this.demanderInfosProjet();

            // Créer le dossier du projet
            const nomProjetClean = this.projectInfo.nom.replace(/[^a-zA-Z0-9_-]/g, '_');
            this.projectPath = pathModule.join(process.cwd(), nomProjetClean);

            console.log(`\n Création du projet dans : ${this.projectPath}`);

            // Créer la structure
            if (!await this.creerStructureDossiers()) {
                throw new Error('Erreur lors de la création de la structure');
            }
            console.log(" Structure des dossiers créée");

            // Générer les fichiers
            if (!await this.creerFichierPrincipal(this.projectPath)) {
                throw new Error('Erreur lors de la création du fichier principal');
            }
            console.log(" Fichier principal créé");

            if (!await this.genererReadme(this.projectPath)) {
                throw new Error('Erreur lors de la création du README');
            }
            console.log(" README.md créé");

            console.log("\n✅ Projet créé avec succès !");
            console.log(`📁 Emplacement : ${this.projectPath}`);
            return true;

        } catch (error) {
            console.error("\n❌ Erreur lors de la création du projet:", error.message);
            return false;
        }
    }

    async test() {
        try {
            this.projectInfo = {
                nom: 'projet_test',
                description: 'Projet de test',
                auteur: 'TestRunner',
                categorie: 1,
                web: {
                    style: '1',
                    framework: '1'
                }
            };

            this.projectPath = pathModule.join(process.cwd(), 'test_output');
            
            if (!await this.creerStructureDossiers()) {
                throw new Error('Échec de la création de la structure');
            }

            if (!await this.creerFichierPrincipal(this.projectPath)) {
                throw new Error('Échec de la création du fichier principal');
            }

            if (!await this.genererReadme(this.projectPath)) {
                throw new Error('Échec de la création du README');
            }

            console.log('✅ Test terminé avec succès');
            return true;
        } catch (error) {
            console.error('❌ Erreur pendant le test:', error.message);
            return false;
        }
    }
}

// Exporter la classe pour les tests
module.exports = ProjectGenerator;

// Exécution principale
if (require.main === module) {
    const generator = new ProjectGenerator();
    if (process.argv.includes("--test")) {
        generator.test();
    } else {
        generator.genererProjet();
    }
}
