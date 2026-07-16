import { obtenirProfilEleve } from "@/app/actions";
import { EcranProfil } from "@/app/_composants/EcranProfil";

export default async function PageProfil() {
  const profil = await obtenirProfilEleve();

  return <EcranProfil profil={profil} />;
}
