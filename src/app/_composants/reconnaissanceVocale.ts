/** API SpeechRecognition (Chrome / Edge / Safari). */

export interface ResultatReconnaissance {
  readonly finals: string;
  readonly interim: string;
}

export interface SessionReconnaissanceVocale {
  demarrer: () => void;
  arreter: () => void;
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function obtenirConstructeur(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function reconnaissanceVocaleDisponible(): boolean {
  return obtenirConstructeur() !== null;
}

/**
 * Session de dictée temps réel (Web Speech API).
 * Les résultats finals s'accumulent ; l'interim est volatif.
 */
export function creerSessionReconnaissanceVocale(options: {
  langue?: string;
  onMiseAJour: (resultat: ResultatReconnaissance) => void;
  onErreur: (message: string) => void;
  onFin: () => void;
}): SessionReconnaissanceVocale | null {
  const Ctor = obtenirConstructeur();
  if (!Ctor) return null;

  const reco = new Ctor();
  reco.lang = options.langue ?? "fr-FR";
  reco.continuous = true;
  reco.interimResults = true;

  let finals = "";
  let redemarrerSiFin = true;

  reco.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]!;
      const transcript = result[0]?.transcript ?? "";
      if (result.isFinal) {
        finals = `${finals} ${transcript}`.trim();
      } else {
        interim += transcript;
      }
    }
    options.onMiseAJour({ finals, interim: interim.trim() });
  };

  reco.onerror = (event) => {
    if (event.error === "aborted" || event.error === "no-speech") {
      return;
    }
    redemarrerSiFin = false;
    if (event.error === "not-allowed") {
      options.onErreur("Accès au micro refusé.");
    } else {
      options.onErreur("Dictée interrompue. Tu peux continuer à écrire.");
    }
  };

  reco.onend = () => {
    // Chrome coupe parfois la session ; on relance tant que l'utilisateur dicte.
    if (redemarrerSiFin) {
      try {
        reco.start();
        return;
      } catch {
        // déjà démarré ou stoppé volontairement
      }
    }
    options.onFin();
  };

  return {
    demarrer: () => {
      redemarrerSiFin = true;
      finals = "";
      reco.start();
    },
    arreter: () => {
      redemarrerSiFin = false;
      try {
        reco.stop();
      } catch {
        options.onFin();
      }
    },
  };
}
