"use client";

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type TextareaHTMLAttributes,
} from "react";
import { transcrireAudio } from "@/app/actions";
import { fusionnerTexteSaisie } from "./fusionnerTexteSaisie";
import { EcranAttente } from "./attente/EcranAttente";
import {
  creerSessionReconnaissanceVocale,
  reconnaissanceVocaleDisponible,
  type SessionReconnaissanceVocale,
} from "./reconnaissanceVocale";

interface ZoneTexteProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  desactiverMicro?: boolean;
}

function mimeEnregistrement(): string {
  if (typeof MediaRecorder !== "undefined") {
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      return "audio/webm;codecs=opus";
    }
    if (MediaRecorder.isTypeSupported("audio/webm")) {
      return "audio/webm";
    }
  }
  return "audio/webm";
}

function declencherChange(
  textarea: HTMLTextAreaElement,
  onChange: ZoneTexteProps["onChange"],
  nouvelleValeur: string,
) {
  textarea.value = nouvelleValeur;
  if (onChange) {
    const event = {
      target: textarea,
      currentTarget: textarea,
    } as ChangeEvent<HTMLTextAreaElement>;
    onChange(event);
  }
}

export function ZoneTexte({
  label,
  className = "",
  desactiverMicro = false,
  disabled,
  onChange,
  value,
  ...props
}: ZoneTexteProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const sessionRecoRef = useRef<SessionReconnaissanceVocale | null>(null);
  const prefixeDictéeRef = useRef("");
  const [enregistrement, setEnregistrement] = useState(false);
  const [transcriptionEnCours, setTranscriptionEnCours] = useState(false);
  const [erreurMicro, setErreurMicro] = useState<string | null>(null);

  const microIndisponible =
    desactiverMicro || disabled || transcriptionEnCours;

  const valeurCourante = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return "";
    if (value !== undefined && value !== null) return String(value);
    return textarea.value;
  }, [value]);

  const appliquerValeur = useCallback(
    (nouvelleValeur: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      declencherChange(textarea, onChange, nouvelleValeur);
    },
    [onChange],
  );

  const appliquerTranscriptionServeur = useCallback(
    (transcription: string) => {
      appliquerValeur(fusionnerTexteSaisie(valeurCourante(), transcription));
    },
    [appliquerValeur, valeurCourante],
  );

  const arreterFallbackServeur = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setEnregistrement(false);
      return;
    }

    await new Promise<void>((resolve) => {
      recorder.addEventListener("stop", () => resolve(), { once: true });
      recorder.stop();
    });

    mediaRecorderRef.current = null;
    setEnregistrement(false);

    const mime = recorder.mimeType || mimeEnregistrement();
    const blob = new Blob(chunksRef.current, { type: mime });
    chunksRef.current = [];

    if (blob.size === 0) {
      setErreurMicro("Enregistrement vide. Réessaie.");
      return;
    }

    setTranscriptionEnCours(true);
    setErreurMicro(null);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "enregistrement.webm");
      formData.append("mediaType", mime);
      formData.append("langue", "fr");
      const { texte } = await transcrireAudio(formData);
      appliquerTranscriptionServeur(texte);
    } catch {
      setErreurMicro("Transcription impossible. Tu peux continuer à écrire.");
    } finally {
      setTranscriptionEnCours(false);
    }
  }, [appliquerTranscriptionServeur]);

  const demarrerFallbackServeur = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setErreurMicro("Micro non disponible sur cet appareil.");
      return;
    }

    try {
      const flux = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = mimeEnregistrement();
      const recorder = new MediaRecorder(flux, { mimeType: mime });
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        flux.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setEnregistrement(true);
    } catch {
      setErreurMicro("Accès au micro refusé ou indisponible.");
    }
  }, []);

  const arreterDictéeTempsReel = useCallback(() => {
    const session = sessionRecoRef.current;
    sessionRecoRef.current = null;
    if (session) {
      session.arreter();
    }
    setEnregistrement(false);
  }, []);

  const demarrerDictéeTempsReel = useCallback(() => {
    prefixeDictéeRef.current = valeurCourante().trimEnd();

    const session = creerSessionReconnaissanceVocale({
      langue: "fr-FR",
      onMiseAJour: ({ finals, interim }) => {
        const dictée = [finals, interim].filter(Boolean).join(" ").trim();
        appliquerValeur(
          fusionnerTexteSaisie(prefixeDictéeRef.current, dictée),
        );
      },
      onErreur: (message) => {
        setErreurMicro(message);
        sessionRecoRef.current = null;
        setEnregistrement(false);
      },
      onFin: () => {
        sessionRecoRef.current = null;
        setEnregistrement(false);
      },
    });

    if (!session) {
      void demarrerFallbackServeur();
      return;
    }

    sessionRecoRef.current = session;
    try {
      session.demarrer();
      setEnregistrement(true);
    } catch {
      sessionRecoRef.current = null;
      void demarrerFallbackServeur();
    }
  }, [appliquerValeur, demarrerFallbackServeur, valeurCourante]);

  function basculerMicro() {
    if (microIndisponible) return;
    setErreurMicro(null);

    if (enregistrement) {
      if (sessionRecoRef.current) {
        arreterDictéeTempsReel();
      } else {
        void arreterFallbackServeur();
      }
      return;
    }

    if (reconnaissanceVocaleDisponible()) {
      demarrerDictéeTempsReel();
    } else {
      void demarrerFallbackServeur();
    }
  }

  const titreMicro = enregistrement
    ? "Arrêter la dictée"
    : transcriptionEnCours
      ? "Transcription en cours…"
      : "Dicter au micro";

  return (
    <div className="flex flex-col gap-2">
      {(label || !desactiverMicro) && (
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <label className="text-sm font-medium text-texte-secondaire">
              {label}
            </label>
          ) : (
            <span />
          )}
          {!desactiverMicro && (
            <button
              type="button"
              onClick={basculerMicro}
              disabled={microIndisponible}
              title={titreMicro}
              aria-label={titreMicro}
              aria-pressed={enregistrement}
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-40 ${
                enregistrement
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-bordure bg-surface text-texte-secondaire hover:border-accent hover:text-accent"
              }`}
            >
              {transcriptionEnCours ? (
                <span className="h-4 w-4 animate-pulse rounded-full bg-accent/60" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
      <textarea
        ref={textareaRef}
        className={`min-h-[120px] w-full resize-y rounded-lg border border-bordure bg-surface px-4 py-3 text-texte placeholder:text-texte-secondaire focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${className}`}
        disabled={disabled || transcriptionEnCours}
        onChange={onChange}
        value={value}
        {...props}
      />
      {erreurMicro && (
        <p className="text-sm text-texte-secondaire" role="status">
          {erreurMicro}
        </p>
      )}
      {transcriptionEnCours && (
        <EcranAttente phase="transcription" variant="compact" />
      )}
    </div>
  );
}
