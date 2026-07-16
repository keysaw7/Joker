import {
  FOURNISSEURS,
  grouperModelesParCategorie,
  type IdFournisseur,
  type SelectionModele,
  trouverFournisseur,
} from "@/adapters/ai/fournisseurs";

interface SelecteurModeleProps {
  selection: SelectionModele;
  onChanger: (selection: SelectionModele) => void;
}

const styleSelect =
  "w-full rounded-lg border border-bordure bg-surface px-4 py-2.5 text-sm text-texte focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export function SelecteurModele({ selection, onChanger }: SelecteurModeleProps) {
  const fournisseur = trouverFournisseur(selection.fournisseur) ?? FOURNISSEURS[0]!;
  const groupes = grouperModelesParCategorie(fournisseur.modeles);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-bordure bg-surface p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">Modèle IA</h2>
        <p className="text-sm text-texte-secondaire">
          Choisis le fournisseur et le modèle pour ce parcours.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="fournisseur-ia"
            className="text-sm font-medium text-texte-secondaire"
          >
            Fournisseur
          </label>
          <select
            id="fournisseur-ia"
            className={styleSelect}
            value={selection.fournisseur}
            onChange={(e) => {
              const id = e.target.value as IdFournisseur;
              const nouveau = trouverFournisseur(id) ?? FOURNISSEURS[0]!;
              onChanger({
                fournisseur: nouveau.id,
                modele: nouveau.modeles[0]!.id,
              });
            }}
          >
            {FOURNISSEURS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="modele-ia"
            className="text-sm font-medium text-texte-secondaire"
          >
            Modèle
          </label>
          <select
            id="modele-ia"
            className={styleSelect}
            value={selection.modele}
            onChange={(e) =>
              onChanger({ fournisseur: selection.fournisseur, modele: e.target.value })
            }
          >
            {groupes.map((groupe) => (
              <optgroup key={groupe.categorie} label={groupe.libelle}>
                {groupe.modeles.map((modele) => (
                  <option key={modele.id} value={modele.id}>
                    {modele.nom}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
