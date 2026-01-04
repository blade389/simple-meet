// Email and notification translations for all supported languages

export type SupportedLanguage = 'it' | 'en' | 'fr' | 'de' | 'es' | 'pt' | 'nl' | 'pl';

export const translations: Record<SupportedLanguage, {
  // Common
  common: {
    greeting: string;
    regards: string;
    team: string;
    viewProfile: string;
    goToApp: string;
  };
  // Welcome email
  welcome: {
    subject: string;
    title: string;
    intro: string;
    steps: {
      verify: string;
      uploadPhoto: string;
      browse: string;
      sendRequest: string;
    };
    cta: string;
  };
  // Match request
  matchRequest: {
    subject: string;
    premiumSubject: string;
    title: string;
    premiumTitle: string;
    message: string;
    premiumMessage: string;
    cta: string;
    notification: string;
    premiumNotification: string;
  };
  // Request accepted
  requestAccepted: {
    subject: string;
    title: string;
    message: string;
    scheduleReminder: string;
    cta: string;
    notification: string;
  };
  // Appointment scheduled
  appointmentScheduled: {
    subject: string;
    title: string;
    message: string;
    date: string;
    location: string;
    cta: string;
    notification: string;
  };
  // Appointment reminder
  appointmentReminder: {
    subject: string;
    title: string;
    message: string;
    notification: string;
  };
  // Verification approved
  verificationApproved: {
    subject: string;
    title: string;
    message: string;
    cta: string;
    notification: string;
  };
  // Photo approved
  photoApproved: {
    subject: string;
    primarySubject: string;
    title: string;
    primaryTitle: string;
    message: string;
    primaryMessage: string;
    cta: string;
    notification: string;
  };
  // Review reminder
  reviewReminder: {
    subject: string;
    title: string;
    message: string;
    cta: string;
    notification: string;
  };
  // Expired request
  expiredRequest: {
    subject: string;
    title: string;
    message: string;
    refundMessage: string;
    notification: string;
  };
  // Request expiring reminder
  requestExpiringReminder: {
    subject: string;
    title: string;
    message: string;
    cta: string;
    notification: string;
  };
  // Appointment deadline reminder
  appointmentDeadlineReminder: {
    subject: string;
    title: string;
    message: string;
    cta: string;
    notification: string;
  };
  // Verification reminder
  verificationReminder: {
    subject: string;
    title: string;
    maleMessage: string;
    femaleMessage: string;
    cta: string;
  };
  // Review action
  reviewAction: {
    tokenDeductedSubject: string;
    tokenDeductedTitle: string;
    tokenDeductedMessage: string;
    blockedSubject: string;
    blockedTitle: string;
    blockedMessage: string;
  };
  // Chat notification
  chatNotification: {
    title: string;
    notification: string;
  };
}> = {
  it: {
    common: {
      greeting: 'Ciao',
      regards: 'Cordiali saluti',
      team: 'Il Team SCOPAMI',
      viewProfile: 'Visualizza Profilo',
      goToApp: 'Vai all\'App',
    },
    welcome: {
      subject: 'Benvenuto su SCOPAMI!',
      title: 'Benvenuto su SCOPAMI!',
      intro: 'Grazie per esserti registrato! Siamo entusiasti di averti con noi.',
      steps: {
        verify: 'Completa la verifica del tuo profilo',
        uploadPhoto: 'Carica una foto profilo',
        browse: 'Sfoglia i profili disponibili',
        sendRequest: 'Invia la tua prima richiesta',
      },
      cta: 'Inizia Ora',
    },
    matchRequest: {
      subject: 'Hai ricevuto una nuova richiesta!',
      premiumSubject: 'Hai ricevuto una richiesta Premium!',
      title: 'Nuova Richiesta di Match',
      premiumTitle: 'Nuova Richiesta Premium',
      message: 'ti ha inviato una richiesta di match.',
      premiumMessage: 'ti ha inviato una richiesta Premium.',
      cta: 'Visualizza Richiesta',
      notification: 'ti ha inviato una richiesta',
      premiumNotification: 'ti ha inviato una richiesta Premium',
    },
    requestAccepted: {
      subject: 'La tua richiesta è stata accettata!',
      title: 'Richiesta Accettata',
      message: 'ha accettato la tua richiesta.',
      scheduleReminder: 'Ricordati di pianificare un appuntamento entro la scadenza.',
      cta: 'Vai alla Chat',
      notification: 'ha accettato la tua richiesta',
    },
    appointmentScheduled: {
      subject: 'Appuntamento Confermato',
      title: 'Appuntamento Programmato',
      message: 'ha programmato un appuntamento con te.',
      date: 'Data e Ora',
      location: 'Luogo',
      cta: 'Visualizza Dettagli',
      notification: 'ha programmato un appuntamento con te',
    },
    appointmentReminder: {
      subject: 'Promemoria: Appuntamento tra 2 ore',
      title: 'Promemoria Appuntamento',
      message: 'Il tuo appuntamento è tra 2 ore.',
      notification: 'Il tuo appuntamento è tra 2 ore',
    },
    verificationApproved: {
      subject: 'Il tuo profilo è stato verificato!',
      title: 'Verifica Completata',
      message: 'Congratulazioni! Il tuo profilo è stato verificato con successo. Ora puoi accedere a tutte le funzionalità della piattaforma.',
      cta: 'Inizia a Esplorare',
      notification: 'Il tuo profilo è stato verificato!',
    },
    photoApproved: {
      subject: 'La tua foto è stata approvata!',
      primarySubject: 'La tua foto profilo è stata approvata!',
      title: 'Foto Approvata',
      primaryTitle: 'Foto Profilo Approvata',
      message: 'La tua foto è stata approvata ed è ora visibile nel tuo profilo.',
      primaryMessage: 'La tua foto profilo è stata approvata! Ora il tuo profilo è visibile agli altri utenti.',
      cta: 'Visualizza Profilo',
      notification: 'La tua foto è stata approvata!',
    },
    reviewReminder: {
      subject: 'Non dimenticare di lasciare una recensione!',
      title: 'Promemoria Recensione',
      message: 'Hai 48 ore per lasciare una recensione del tuo ultimo appuntamento.',
      cta: 'Lascia Recensione',
      notification: 'Non dimenticare di lasciare una recensione',
    },
    expiredRequest: {
      subject: 'La tua richiesta è scaduta',
      title: 'Richiesta Scaduta',
      message: 'La tua richiesta non ha ricevuto risposta ed è scaduta.',
      refundMessage: 'I tuoi token sono stati restituiti.',
      notification: 'La tua richiesta è scaduta',
    },
    requestExpiringReminder: {
      subject: 'La tua richiesta sta per scadere!',
      title: 'Richiesta in Scadenza',
      message: 'Hai una richiesta che scadrà tra un\'ora. Rispondi prima che sia troppo tardi!',
      cta: 'Rispondi Ora',
      notification: 'Hai una richiesta in scadenza',
    },
    appointmentDeadlineReminder: {
      subject: 'Ricordati di pianificare l\'appuntamento!',
      title: 'Scadenza Appuntamento',
      message: 'La scadenza per pianificare un appuntamento è tra un\'ora.',
      cta: 'Pianifica Ora',
      notification: 'Pianifica l\'appuntamento prima della scadenza',
    },
    verificationReminder: {
      subject: 'Completa la verifica del tuo profilo',
      title: 'Verifica in Attesa',
      maleMessage: 'Non hai ancora completato la verifica del tuo profilo. Completa la verifica per poter inviare richieste.',
      femaleMessage: 'Non hai ancora completato la verifica del tuo profilo. Completa la verifica per iniziare a ricevere richieste.',
      cta: 'Completa Verifica',
    },
    reviewAction: {
      tokenDeductedSubject: 'Notifica sull\'account',
      tokenDeductedTitle: 'Token Detratto',
      tokenDeductedMessage: 'A seguito di una segnalazione, un token è stato detratto dal tuo account.',
      blockedSubject: 'Account Sospeso',
      blockedTitle: 'Account Bloccato',
      blockedMessage: 'A seguito di segnalazioni, il tuo account è stato sospeso. Contatta il supporto per maggiori informazioni.',
    },
    chatNotification: {
      title: 'Nuovo Messaggio',
      notification: 'ti ha inviato un messaggio',
    },
  },
  en: {
    common: {
      greeting: 'Hello',
      regards: 'Best regards',
      team: 'The SCOPAMI Team',
      viewProfile: 'View Profile',
      goToApp: 'Go to App',
    },
    welcome: {
      subject: 'Welcome to SCOPAMI!',
      title: 'Welcome to SCOPAMI!',
      intro: 'Thank you for signing up! We\'re excited to have you with us.',
      steps: {
        verify: 'Complete your profile verification',
        uploadPhoto: 'Upload a profile photo',
        browse: 'Browse available profiles',
        sendRequest: 'Send your first request',
      },
      cta: 'Get Started',
    },
    matchRequest: {
      subject: 'You received a new request!',
      premiumSubject: 'You received a Premium request!',
      title: 'New Match Request',
      premiumTitle: 'New Premium Request',
      message: 'sent you a match request.',
      premiumMessage: 'sent you a Premium request.',
      cta: 'View Request',
      notification: 'sent you a request',
      premiumNotification: 'sent you a Premium request',
    },
    requestAccepted: {
      subject: 'Your request has been accepted!',
      title: 'Request Accepted',
      message: 'accepted your request.',
      scheduleReminder: 'Remember to schedule an appointment before the deadline.',
      cta: 'Go to Chat',
      notification: 'accepted your request',
    },
    appointmentScheduled: {
      subject: 'Appointment Confirmed',
      title: 'Appointment Scheduled',
      message: 'scheduled an appointment with you.',
      date: 'Date and Time',
      location: 'Location',
      cta: 'View Details',
      notification: 'scheduled an appointment with you',
    },
    appointmentReminder: {
      subject: 'Reminder: Appointment in 2 hours',
      title: 'Appointment Reminder',
      message: 'Your appointment is in 2 hours.',
      notification: 'Your appointment is in 2 hours',
    },
    verificationApproved: {
      subject: 'Your profile has been verified!',
      title: 'Verification Complete',
      message: 'Congratulations! Your profile has been successfully verified. You can now access all platform features.',
      cta: 'Start Exploring',
      notification: 'Your profile has been verified!',
    },
    photoApproved: {
      subject: 'Your photo has been approved!',
      primarySubject: 'Your profile photo has been approved!',
      title: 'Photo Approved',
      primaryTitle: 'Profile Photo Approved',
      message: 'Your photo has been approved and is now visible on your profile.',
      primaryMessage: 'Your profile photo has been approved! Your profile is now visible to other users.',
      cta: 'View Profile',
      notification: 'Your photo has been approved!',
    },
    reviewReminder: {
      subject: 'Don\'t forget to leave a review!',
      title: 'Review Reminder',
      message: 'You have 48 hours to leave a review for your last appointment.',
      cta: 'Leave Review',
      notification: 'Don\'t forget to leave a review',
    },
    expiredRequest: {
      subject: 'Your request has expired',
      title: 'Request Expired',
      message: 'Your request did not receive a response and has expired.',
      refundMessage: 'Your tokens have been refunded.',
      notification: 'Your request has expired',
    },
    requestExpiringReminder: {
      subject: 'Your request is about to expire!',
      title: 'Request Expiring',
      message: 'You have a request expiring in one hour. Respond before it\'s too late!',
      cta: 'Respond Now',
      notification: 'You have a request expiring soon',
    },
    appointmentDeadlineReminder: {
      subject: 'Remember to schedule the appointment!',
      title: 'Appointment Deadline',
      message: 'The deadline to schedule an appointment is in one hour.',
      cta: 'Schedule Now',
      notification: 'Schedule the appointment before the deadline',
    },
    verificationReminder: {
      subject: 'Complete your profile verification',
      title: 'Verification Pending',
      maleMessage: 'You haven\'t completed your profile verification yet. Complete verification to send requests.',
      femaleMessage: 'You haven\'t completed your profile verification yet. Complete verification to start receiving requests.',
      cta: 'Complete Verification',
    },
    reviewAction: {
      tokenDeductedSubject: 'Account Notification',
      tokenDeductedTitle: 'Token Deducted',
      tokenDeductedMessage: 'Following a report, a token has been deducted from your account.',
      blockedSubject: 'Account Suspended',
      blockedTitle: 'Account Blocked',
      blockedMessage: 'Following reports, your account has been suspended. Contact support for more information.',
    },
    chatNotification: {
      title: 'New Message',
      notification: 'sent you a message',
    },
  },
  fr: {
    common: {
      greeting: 'Bonjour',
      regards: 'Cordialement',
      team: 'L\'équipe SCOPAMI',
      viewProfile: 'Voir le Profil',
      goToApp: 'Aller à l\'App',
    },
    welcome: {
      subject: 'Bienvenue sur SCOPAMI!',
      title: 'Bienvenue sur SCOPAMI!',
      intro: 'Merci de vous être inscrit! Nous sommes ravis de vous accueillir.',
      steps: {
        verify: 'Complétez la vérification de votre profil',
        uploadPhoto: 'Téléchargez une photo de profil',
        browse: 'Parcourez les profils disponibles',
        sendRequest: 'Envoyez votre première demande',
      },
      cta: 'Commencer',
    },
    matchRequest: {
      subject: 'Vous avez reçu une nouvelle demande!',
      premiumSubject: 'Vous avez reçu une demande Premium!',
      title: 'Nouvelle Demande de Match',
      premiumTitle: 'Nouvelle Demande Premium',
      message: 'vous a envoyé une demande de match.',
      premiumMessage: 'vous a envoyé une demande Premium.',
      cta: 'Voir la Demande',
      notification: 'vous a envoyé une demande',
      premiumNotification: 'vous a envoyé une demande Premium',
    },
    requestAccepted: {
      subject: 'Votre demande a été acceptée!',
      title: 'Demande Acceptée',
      message: 'a accepté votre demande.',
      scheduleReminder: 'N\'oubliez pas de planifier un rendez-vous avant la date limite.',
      cta: 'Aller au Chat',
      notification: 'a accepté votre demande',
    },
    appointmentScheduled: {
      subject: 'Rendez-vous Confirmé',
      title: 'Rendez-vous Programmé',
      message: 'a programmé un rendez-vous avec vous.',
      date: 'Date et Heure',
      location: 'Lieu',
      cta: 'Voir les Détails',
      notification: 'a programmé un rendez-vous avec vous',
    },
    appointmentReminder: {
      subject: 'Rappel: Rendez-vous dans 2 heures',
      title: 'Rappel de Rendez-vous',
      message: 'Votre rendez-vous est dans 2 heures.',
      notification: 'Votre rendez-vous est dans 2 heures',
    },
    verificationApproved: {
      subject: 'Votre profil a été vérifié!',
      title: 'Vérification Terminée',
      message: 'Félicitations! Votre profil a été vérifié avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités.',
      cta: 'Commencer à Explorer',
      notification: 'Votre profil a été vérifié!',
    },
    photoApproved: {
      subject: 'Votre photo a été approuvée!',
      primarySubject: 'Votre photo de profil a été approuvée!',
      title: 'Photo Approuvée',
      primaryTitle: 'Photo de Profil Approuvée',
      message: 'Votre photo a été approuvée et est maintenant visible sur votre profil.',
      primaryMessage: 'Votre photo de profil a été approuvée! Votre profil est maintenant visible.',
      cta: 'Voir le Profil',
      notification: 'Votre photo a été approuvée!',
    },
    reviewReminder: {
      subject: 'N\'oubliez pas de laisser un avis!',
      title: 'Rappel d\'Avis',
      message: 'Vous avez 48 heures pour laisser un avis sur votre dernier rendez-vous.',
      cta: 'Laisser un Avis',
      notification: 'N\'oubliez pas de laisser un avis',
    },
    expiredRequest: {
      subject: 'Votre demande a expiré',
      title: 'Demande Expirée',
      message: 'Votre demande n\'a pas reçu de réponse et a expiré.',
      refundMessage: 'Vos tokens ont été remboursés.',
      notification: 'Votre demande a expiré',
    },
    requestExpiringReminder: {
      subject: 'Votre demande va bientôt expirer!',
      title: 'Demande Expirante',
      message: 'Vous avez une demande qui expire dans une heure. Répondez avant qu\'il ne soit trop tard!',
      cta: 'Répondre Maintenant',
      notification: 'Vous avez une demande qui expire bientôt',
    },
    appointmentDeadlineReminder: {
      subject: 'N\'oubliez pas de planifier le rendez-vous!',
      title: 'Date Limite du Rendez-vous',
      message: 'La date limite pour planifier un rendez-vous est dans une heure.',
      cta: 'Planifier Maintenant',
      notification: 'Planifiez le rendez-vous avant la date limite',
    },
    verificationReminder: {
      subject: 'Complétez la vérification de votre profil',
      title: 'Vérification en Attente',
      maleMessage: 'Vous n\'avez pas encore complété la vérification de votre profil. Complétez la vérification pour envoyer des demandes.',
      femaleMessage: 'Vous n\'avez pas encore complété la vérification de votre profil. Complétez la vérification pour recevoir des demandes.',
      cta: 'Compléter la Vérification',
    },
    reviewAction: {
      tokenDeductedSubject: 'Notification de Compte',
      tokenDeductedTitle: 'Token Déduit',
      tokenDeductedMessage: 'Suite à un signalement, un token a été déduit de votre compte.',
      blockedSubject: 'Compte Suspendu',
      blockedTitle: 'Compte Bloqué',
      blockedMessage: 'Suite à des signalements, votre compte a été suspendu. Contactez le support pour plus d\'informations.',
    },
    chatNotification: {
      title: 'Nouveau Message',
      notification: 'vous a envoyé un message',
    },
  },
  de: {
    common: {
      greeting: 'Hallo',
      regards: 'Mit freundlichen Grüßen',
      team: 'Das SCOPAMI Team',
      viewProfile: 'Profil Ansehen',
      goToApp: 'Zur App',
    },
    welcome: {
      subject: 'Willkommen bei SCOPAMI!',
      title: 'Willkommen bei SCOPAMI!',
      intro: 'Danke für deine Registrierung! Wir freuen uns, dich bei uns zu haben.',
      steps: {
        verify: 'Vervollständige deine Profilverifizierung',
        uploadPhoto: 'Lade ein Profilbild hoch',
        browse: 'Durchsuche verfügbare Profile',
        sendRequest: 'Sende deine erste Anfrage',
      },
      cta: 'Jetzt Starten',
    },
    matchRequest: {
      subject: 'Du hast eine neue Anfrage erhalten!',
      premiumSubject: 'Du hast eine Premium-Anfrage erhalten!',
      title: 'Neue Match-Anfrage',
      premiumTitle: 'Neue Premium-Anfrage',
      message: 'hat dir eine Match-Anfrage gesendet.',
      premiumMessage: 'hat dir eine Premium-Anfrage gesendet.',
      cta: 'Anfrage Ansehen',
      notification: 'hat dir eine Anfrage gesendet',
      premiumNotification: 'hat dir eine Premium-Anfrage gesendet',
    },
    requestAccepted: {
      subject: 'Deine Anfrage wurde akzeptiert!',
      title: 'Anfrage Akzeptiert',
      message: 'hat deine Anfrage akzeptiert.',
      scheduleReminder: 'Denke daran, vor Ablauf der Frist einen Termin zu vereinbaren.',
      cta: 'Zum Chat',
      notification: 'hat deine Anfrage akzeptiert',
    },
    appointmentScheduled: {
      subject: 'Termin Bestätigt',
      title: 'Termin Geplant',
      message: 'hat einen Termin mit dir vereinbart.',
      date: 'Datum und Uhrzeit',
      location: 'Ort',
      cta: 'Details Ansehen',
      notification: 'hat einen Termin mit dir vereinbart',
    },
    appointmentReminder: {
      subject: 'Erinnerung: Termin in 2 Stunden',
      title: 'Terminerinnerung',
      message: 'Dein Termin ist in 2 Stunden.',
      notification: 'Dein Termin ist in 2 Stunden',
    },
    verificationApproved: {
      subject: 'Dein Profil wurde verifiziert!',
      title: 'Verifizierung Abgeschlossen',
      message: 'Herzlichen Glückwunsch! Dein Profil wurde erfolgreich verifiziert. Du kannst jetzt alle Funktionen nutzen.',
      cta: 'Jetzt Entdecken',
      notification: 'Dein Profil wurde verifiziert!',
    },
    photoApproved: {
      subject: 'Dein Foto wurde genehmigt!',
      primarySubject: 'Dein Profilbild wurde genehmigt!',
      title: 'Foto Genehmigt',
      primaryTitle: 'Profilbild Genehmigt',
      message: 'Dein Foto wurde genehmigt und ist jetzt in deinem Profil sichtbar.',
      primaryMessage: 'Dein Profilbild wurde genehmigt! Dein Profil ist jetzt für andere Benutzer sichtbar.',
      cta: 'Profil Ansehen',
      notification: 'Dein Foto wurde genehmigt!',
    },
    reviewReminder: {
      subject: 'Vergiss nicht, eine Bewertung abzugeben!',
      title: 'Bewertungserinnerung',
      message: 'Du hast 48 Stunden Zeit, eine Bewertung für deinen letzten Termin abzugeben.',
      cta: 'Bewertung Abgeben',
      notification: 'Vergiss nicht, eine Bewertung abzugeben',
    },
    expiredRequest: {
      subject: 'Deine Anfrage ist abgelaufen',
      title: 'Anfrage Abgelaufen',
      message: 'Deine Anfrage hat keine Antwort erhalten und ist abgelaufen.',
      refundMessage: 'Deine Token wurden erstattet.',
      notification: 'Deine Anfrage ist abgelaufen',
    },
    requestExpiringReminder: {
      subject: 'Deine Anfrage läuft bald ab!',
      title: 'Anfrage Läuft Ab',
      message: 'Du hast eine Anfrage, die in einer Stunde abläuft. Antworte, bevor es zu spät ist!',
      cta: 'Jetzt Antworten',
      notification: 'Du hast eine Anfrage, die bald abläuft',
    },
    appointmentDeadlineReminder: {
      subject: 'Vergiss nicht, den Termin zu planen!',
      title: 'Terminfrist',
      message: 'Die Frist zur Terminvereinbarung endet in einer Stunde.',
      cta: 'Jetzt Planen',
      notification: 'Plane den Termin vor Ablauf der Frist',
    },
    verificationReminder: {
      subject: 'Vervollständige deine Profilverifizierung',
      title: 'Verifizierung Ausstehend',
      maleMessage: 'Du hast deine Profilverifizierung noch nicht abgeschlossen. Schließe die Verifizierung ab, um Anfragen zu senden.',
      femaleMessage: 'Du hast deine Profilverifizierung noch nicht abgeschlossen. Schließe die Verifizierung ab, um Anfragen zu erhalten.',
      cta: 'Verifizierung Abschließen',
    },
    reviewAction: {
      tokenDeductedSubject: 'Kontobenachrichtigung',
      tokenDeductedTitle: 'Token Abgezogen',
      tokenDeductedMessage: 'Aufgrund einer Meldung wurde ein Token von deinem Konto abgezogen.',
      blockedSubject: 'Konto Gesperrt',
      blockedTitle: 'Konto Blockiert',
      blockedMessage: 'Aufgrund von Meldungen wurde dein Konto gesperrt. Kontaktiere den Support für weitere Informationen.',
    },
    chatNotification: {
      title: 'Neue Nachricht',
      notification: 'hat dir eine Nachricht gesendet',
    },
  },
  es: {
    common: {
      greeting: 'Hola',
      regards: 'Saludos cordiales',
      team: 'El Equipo SCOPAMI',
      viewProfile: 'Ver Perfil',
      goToApp: 'Ir a la App',
    },
    welcome: {
      subject: '¡Bienvenido a SCOPAMI!',
      title: '¡Bienvenido a SCOPAMI!',
      intro: '¡Gracias por registrarte! Estamos encantados de tenerte con nosotros.',
      steps: {
        verify: 'Completa la verificación de tu perfil',
        uploadPhoto: 'Sube una foto de perfil',
        browse: 'Explora los perfiles disponibles',
        sendRequest: 'Envía tu primera solicitud',
      },
      cta: 'Comenzar',
    },
    matchRequest: {
      subject: '¡Has recibido una nueva solicitud!',
      premiumSubject: '¡Has recibido una solicitud Premium!',
      title: 'Nueva Solicitud de Match',
      premiumTitle: 'Nueva Solicitud Premium',
      message: 'te ha enviado una solicitud de match.',
      premiumMessage: 'te ha enviado una solicitud Premium.',
      cta: 'Ver Solicitud',
      notification: 'te ha enviado una solicitud',
      premiumNotification: 'te ha enviado una solicitud Premium',
    },
    requestAccepted: {
      subject: '¡Tu solicitud ha sido aceptada!',
      title: 'Solicitud Aceptada',
      message: 'ha aceptado tu solicitud.',
      scheduleReminder: 'Recuerda programar una cita antes de la fecha límite.',
      cta: 'Ir al Chat',
      notification: 'ha aceptado tu solicitud',
    },
    appointmentScheduled: {
      subject: 'Cita Confirmada',
      title: 'Cita Programada',
      message: 'ha programado una cita contigo.',
      date: 'Fecha y Hora',
      location: 'Ubicación',
      cta: 'Ver Detalles',
      notification: 'ha programado una cita contigo',
    },
    appointmentReminder: {
      subject: 'Recordatorio: Cita en 2 horas',
      title: 'Recordatorio de Cita',
      message: 'Tu cita es en 2 horas.',
      notification: 'Tu cita es en 2 horas',
    },
    verificationApproved: {
      subject: '¡Tu perfil ha sido verificado!',
      title: 'Verificación Completada',
      message: '¡Felicitaciones! Tu perfil ha sido verificado exitosamente. Ahora puedes acceder a todas las funcionalidades.',
      cta: 'Empezar a Explorar',
      notification: '¡Tu perfil ha sido verificado!',
    },
    photoApproved: {
      subject: '¡Tu foto ha sido aprobada!',
      primarySubject: '¡Tu foto de perfil ha sido aprobada!',
      title: 'Foto Aprobada',
      primaryTitle: 'Foto de Perfil Aprobada',
      message: 'Tu foto ha sido aprobada y ahora es visible en tu perfil.',
      primaryMessage: '¡Tu foto de perfil ha sido aprobada! Tu perfil ahora es visible para otros usuarios.',
      cta: 'Ver Perfil',
      notification: '¡Tu foto ha sido aprobada!',
    },
    reviewReminder: {
      subject: '¡No olvides dejar una reseña!',
      title: 'Recordatorio de Reseña',
      message: 'Tienes 48 horas para dejar una reseña de tu última cita.',
      cta: 'Dejar Reseña',
      notification: 'No olvides dejar una reseña',
    },
    expiredRequest: {
      subject: 'Tu solicitud ha expirado',
      title: 'Solicitud Expirada',
      message: 'Tu solicitud no recibió respuesta y ha expirado.',
      refundMessage: 'Tus tokens han sido reembolsados.',
      notification: 'Tu solicitud ha expirado',
    },
    requestExpiringReminder: {
      subject: '¡Tu solicitud está por expirar!',
      title: 'Solicitud Expirando',
      message: 'Tienes una solicitud que expira en una hora. ¡Responde antes de que sea tarde!',
      cta: 'Responder Ahora',
      notification: 'Tienes una solicitud que expira pronto',
    },
    appointmentDeadlineReminder: {
      subject: '¡Recuerda programar la cita!',
      title: 'Fecha Límite de Cita',
      message: 'La fecha límite para programar una cita es en una hora.',
      cta: 'Programar Ahora',
      notification: 'Programa la cita antes de la fecha límite',
    },
    verificationReminder: {
      subject: 'Completa la verificación de tu perfil',
      title: 'Verificación Pendiente',
      maleMessage: 'Aún no has completado la verificación de tu perfil. Completa la verificación para enviar solicitudes.',
      femaleMessage: 'Aún no has completado la verificación de tu perfil. Completa la verificación para recibir solicitudes.',
      cta: 'Completar Verificación',
    },
    reviewAction: {
      tokenDeductedSubject: 'Notificación de Cuenta',
      tokenDeductedTitle: 'Token Deducido',
      tokenDeductedMessage: 'Debido a un reporte, un token ha sido deducido de tu cuenta.',
      blockedSubject: 'Cuenta Suspendida',
      blockedTitle: 'Cuenta Bloqueada',
      blockedMessage: 'Debido a reportes, tu cuenta ha sido suspendida. Contacta al soporte para más información.',
    },
    chatNotification: {
      title: 'Nuevo Mensaje',
      notification: 'te ha enviado un mensaje',
    },
  },
  pt: {
    common: {
      greeting: 'Olá',
      regards: 'Atenciosamente',
      team: 'A Equipe SCOPAMI',
      viewProfile: 'Ver Perfil',
      goToApp: 'Ir para o App',
    },
    welcome: {
      subject: 'Bem-vindo ao SCOPAMI!',
      title: 'Bem-vindo ao SCOPAMI!',
      intro: 'Obrigado por se registrar! Estamos animados em tê-lo conosco.',
      steps: {
        verify: 'Complete a verificação do seu perfil',
        uploadPhoto: 'Faça upload de uma foto de perfil',
        browse: 'Explore os perfis disponíveis',
        sendRequest: 'Envie sua primeira solicitação',
      },
      cta: 'Começar',
    },
    matchRequest: {
      subject: 'Você recebeu uma nova solicitação!',
      premiumSubject: 'Você recebeu uma solicitação Premium!',
      title: 'Nova Solicitação de Match',
      premiumTitle: 'Nova Solicitação Premium',
      message: 'enviou uma solicitação de match para você.',
      premiumMessage: 'enviou uma solicitação Premium para você.',
      cta: 'Ver Solicitação',
      notification: 'enviou uma solicitação para você',
      premiumNotification: 'enviou uma solicitação Premium para você',
    },
    requestAccepted: {
      subject: 'Sua solicitação foi aceita!',
      title: 'Solicitação Aceita',
      message: 'aceitou sua solicitação.',
      scheduleReminder: 'Lembre-se de agendar um encontro antes do prazo.',
      cta: 'Ir para o Chat',
      notification: 'aceitou sua solicitação',
    },
    appointmentScheduled: {
      subject: 'Encontro Confirmado',
      title: 'Encontro Agendado',
      message: 'agendou um encontro com você.',
      date: 'Data e Hora',
      location: 'Local',
      cta: 'Ver Detalhes',
      notification: 'agendou um encontro com você',
    },
    appointmentReminder: {
      subject: 'Lembrete: Encontro em 2 horas',
      title: 'Lembrete de Encontro',
      message: 'Seu encontro é em 2 horas.',
      notification: 'Seu encontro é em 2 horas',
    },
    verificationApproved: {
      subject: 'Seu perfil foi verificado!',
      title: 'Verificação Concluída',
      message: 'Parabéns! Seu perfil foi verificado com sucesso. Agora você pode acessar todas as funcionalidades.',
      cta: 'Começar a Explorar',
      notification: 'Seu perfil foi verificado!',
    },
    photoApproved: {
      subject: 'Sua foto foi aprovada!',
      primarySubject: 'Sua foto de perfil foi aprovada!',
      title: 'Foto Aprovada',
      primaryTitle: 'Foto de Perfil Aprovada',
      message: 'Sua foto foi aprovada e agora está visível no seu perfil.',
      primaryMessage: 'Sua foto de perfil foi aprovada! Seu perfil agora está visível para outros usuários.',
      cta: 'Ver Perfil',
      notification: 'Sua foto foi aprovada!',
    },
    reviewReminder: {
      subject: 'Não esqueça de deixar uma avaliação!',
      title: 'Lembrete de Avaliação',
      message: 'Você tem 48 horas para deixar uma avaliação do seu último encontro.',
      cta: 'Deixar Avaliação',
      notification: 'Não esqueça de deixar uma avaliação',
    },
    expiredRequest: {
      subject: 'Sua solicitação expirou',
      title: 'Solicitação Expirada',
      message: 'Sua solicitação não recebeu resposta e expirou.',
      refundMessage: 'Seus tokens foram reembolsados.',
      notification: 'Sua solicitação expirou',
    },
    requestExpiringReminder: {
      subject: 'Sua solicitação está prestes a expirar!',
      title: 'Solicitação Expirando',
      message: 'Você tem uma solicitação que expira em uma hora. Responda antes que seja tarde!',
      cta: 'Responder Agora',
      notification: 'Você tem uma solicitação que expira em breve',
    },
    appointmentDeadlineReminder: {
      subject: 'Lembre-se de agendar o encontro!',
      title: 'Prazo do Encontro',
      message: 'O prazo para agendar um encontro termina em uma hora.',
      cta: 'Agendar Agora',
      notification: 'Agende o encontro antes do prazo',
    },
    verificationReminder: {
      subject: 'Complete a verificação do seu perfil',
      title: 'Verificação Pendente',
      maleMessage: 'Você ainda não completou a verificação do seu perfil. Complete a verificação para enviar solicitações.',
      femaleMessage: 'Você ainda não completou a verificação do seu perfil. Complete a verificação para receber solicitações.',
      cta: 'Completar Verificação',
    },
    reviewAction: {
      tokenDeductedSubject: 'Notificação de Conta',
      tokenDeductedTitle: 'Token Deduzido',
      tokenDeductedMessage: 'Devido a uma denúncia, um token foi deduzido da sua conta.',
      blockedSubject: 'Conta Suspensa',
      blockedTitle: 'Conta Bloqueada',
      blockedMessage: 'Devido a denúncias, sua conta foi suspensa. Entre em contato com o suporte para mais informações.',
    },
    chatNotification: {
      title: 'Nova Mensagem',
      notification: 'enviou uma mensagem para você',
    },
  },
  nl: {
    common: {
      greeting: 'Hallo',
      regards: 'Met vriendelijke groet',
      team: 'Het SCOPAMI Team',
      viewProfile: 'Profiel Bekijken',
      goToApp: 'Naar de App',
    },
    welcome: {
      subject: 'Welkom bij SCOPAMI!',
      title: 'Welkom bij SCOPAMI!',
      intro: 'Bedankt voor je registratie! We zijn blij je te verwelkomen.',
      steps: {
        verify: 'Voltooi je profielverificatie',
        uploadPhoto: 'Upload een profielfoto',
        browse: 'Bekijk beschikbare profielen',
        sendRequest: 'Stuur je eerste verzoek',
      },
      cta: 'Aan de Slag',
    },
    matchRequest: {
      subject: 'Je hebt een nieuw verzoek ontvangen!',
      premiumSubject: 'Je hebt een Premium verzoek ontvangen!',
      title: 'Nieuw Match Verzoek',
      premiumTitle: 'Nieuw Premium Verzoek',
      message: 'heeft je een match verzoek gestuurd.',
      premiumMessage: 'heeft je een Premium verzoek gestuurd.',
      cta: 'Verzoek Bekijken',
      notification: 'heeft je een verzoek gestuurd',
      premiumNotification: 'heeft je een Premium verzoek gestuurd',
    },
    requestAccepted: {
      subject: 'Je verzoek is geaccepteerd!',
      title: 'Verzoek Geaccepteerd',
      message: 'heeft je verzoek geaccepteerd.',
      scheduleReminder: 'Vergeet niet om een afspraak te plannen voor de deadline.',
      cta: 'Naar de Chat',
      notification: 'heeft je verzoek geaccepteerd',
    },
    appointmentScheduled: {
      subject: 'Afspraak Bevestigd',
      title: 'Afspraak Gepland',
      message: 'heeft een afspraak met je gepland.',
      date: 'Datum en Tijd',
      location: 'Locatie',
      cta: 'Details Bekijken',
      notification: 'heeft een afspraak met je gepland',
    },
    appointmentReminder: {
      subject: 'Herinnering: Afspraak over 2 uur',
      title: 'Afspraak Herinnering',
      message: 'Je afspraak is over 2 uur.',
      notification: 'Je afspraak is over 2 uur',
    },
    verificationApproved: {
      subject: 'Je profiel is geverifieerd!',
      title: 'Verificatie Voltooid',
      message: 'Gefeliciteerd! Je profiel is succesvol geverifieerd. Je hebt nu toegang tot alle functies.',
      cta: 'Begin met Ontdekken',
      notification: 'Je profiel is geverifieerd!',
    },
    photoApproved: {
      subject: 'Je foto is goedgekeurd!',
      primarySubject: 'Je profielfoto is goedgekeurd!',
      title: 'Foto Goedgekeurd',
      primaryTitle: 'Profielfoto Goedgekeurd',
      message: 'Je foto is goedgekeurd en is nu zichtbaar op je profiel.',
      primaryMessage: 'Je profielfoto is goedgekeurd! Je profiel is nu zichtbaar voor andere gebruikers.',
      cta: 'Profiel Bekijken',
      notification: 'Je foto is goedgekeurd!',
    },
    reviewReminder: {
      subject: 'Vergeet niet een beoordeling achter te laten!',
      title: 'Beoordeling Herinnering',
      message: 'Je hebt 48 uur om een beoordeling achter te laten voor je laatste afspraak.',
      cta: 'Beoordeling Geven',
      notification: 'Vergeet niet een beoordeling achter te laten',
    },
    expiredRequest: {
      subject: 'Je verzoek is verlopen',
      title: 'Verzoek Verlopen',
      message: 'Je verzoek heeft geen reactie ontvangen en is verlopen.',
      refundMessage: 'Je tokens zijn teruggestort.',
      notification: 'Je verzoek is verlopen',
    },
    requestExpiringReminder: {
      subject: 'Je verzoek verloopt bijna!',
      title: 'Verzoek Verloopt',
      message: 'Je hebt een verzoek dat over een uur verloopt. Reageer voordat het te laat is!',
      cta: 'Nu Reageren',
      notification: 'Je hebt een verzoek dat bijna verloopt',
    },
    appointmentDeadlineReminder: {
      subject: 'Vergeet niet de afspraak te plannen!',
      title: 'Afspraak Deadline',
      message: 'De deadline om een afspraak te plannen is over een uur.',
      cta: 'Nu Plannen',
      notification: 'Plan de afspraak voor de deadline',
    },
    verificationReminder: {
      subject: 'Voltooi je profielverificatie',
      title: 'Verificatie in Afwachting',
      maleMessage: 'Je hebt je profielverificatie nog niet voltooid. Voltooi de verificatie om verzoeken te versturen.',
      femaleMessage: 'Je hebt je profielverificatie nog niet voltooid. Voltooi de verificatie om verzoeken te ontvangen.',
      cta: 'Verificatie Voltooien',
    },
    reviewAction: {
      tokenDeductedSubject: 'Account Melding',
      tokenDeductedTitle: 'Token Afgetrokken',
      tokenDeductedMessage: 'Na een melding is een token van je account afgetrokken.',
      blockedSubject: 'Account Geschorst',
      blockedTitle: 'Account Geblokkeerd',
      blockedMessage: 'Na meldingen is je account geschorst. Neem contact op met support voor meer informatie.',
    },
    chatNotification: {
      title: 'Nieuw Bericht',
      notification: 'heeft je een bericht gestuurd',
    },
  },
  pl: {
    common: {
      greeting: 'Cześć',
      regards: 'Z poważaniem',
      team: 'Zespół SCOPAMI',
      viewProfile: 'Zobacz Profil',
      goToApp: 'Przejdź do Aplikacji',
    },
    welcome: {
      subject: 'Witaj w SCOPAMI!',
      title: 'Witaj w SCOPAMI!',
      intro: 'Dziękujemy za rejestrację! Cieszymy się, że jesteś z nami.',
      steps: {
        verify: 'Dokończ weryfikację profilu',
        uploadPhoto: 'Prześlij zdjęcie profilowe',
        browse: 'Przeglądaj dostępne profile',
        sendRequest: 'Wyślij swoją pierwszą prośbę',
      },
      cta: 'Rozpocznij',
    },
    matchRequest: {
      subject: 'Otrzymałeś nową prośbę!',
      premiumSubject: 'Otrzymałeś prośbę Premium!',
      title: 'Nowa Prośba o Dopasowanie',
      premiumTitle: 'Nowa Prośba Premium',
      message: 'wysłał(a) Ci prośbę o dopasowanie.',
      premiumMessage: 'wysłał(a) Ci prośbę Premium.',
      cta: 'Zobacz Prośbę',
      notification: 'wysłał(a) Ci prośbę',
      premiumNotification: 'wysłał(a) Ci prośbę Premium',
    },
    requestAccepted: {
      subject: 'Twoja prośba została zaakceptowana!',
      title: 'Prośba Zaakceptowana',
      message: 'zaakceptował(a) Twoją prośbę.',
      scheduleReminder: 'Pamiętaj, aby umówić spotkanie przed terminem.',
      cta: 'Przejdź do Czatu',
      notification: 'zaakceptował(a) Twoją prośbę',
    },
    appointmentScheduled: {
      subject: 'Spotkanie Potwierdzone',
      title: 'Spotkanie Zaplanowane',
      message: 'zaplanował(a) z Tobą spotkanie.',
      date: 'Data i Godzina',
      location: 'Miejsce',
      cta: 'Zobacz Szczegóły',
      notification: 'zaplanował(a) z Tobą spotkanie',
    },
    appointmentReminder: {
      subject: 'Przypomnienie: Spotkanie za 2 godziny',
      title: 'Przypomnienie o Spotkaniu',
      message: 'Twoje spotkanie jest za 2 godziny.',
      notification: 'Twoje spotkanie jest za 2 godziny',
    },
    verificationApproved: {
      subject: 'Twój profil został zweryfikowany!',
      title: 'Weryfikacja Zakończona',
      message: 'Gratulacje! Twój profil został pomyślnie zweryfikowany. Teraz masz dostęp do wszystkich funkcji.',
      cta: 'Zacznij Odkrywać',
      notification: 'Twój profil został zweryfikowany!',
    },
    photoApproved: {
      subject: 'Twoje zdjęcie zostało zatwierdzone!',
      primarySubject: 'Twoje zdjęcie profilowe zostało zatwierdzone!',
      title: 'Zdjęcie Zatwierdzone',
      primaryTitle: 'Zdjęcie Profilowe Zatwierdzone',
      message: 'Twoje zdjęcie zostało zatwierdzone i jest teraz widoczne na Twoim profilu.',
      primaryMessage: 'Twoje zdjęcie profilowe zostało zatwierdzone! Twój profil jest teraz widoczny dla innych użytkowników.',
      cta: 'Zobacz Profil',
      notification: 'Twoje zdjęcie zostało zatwierdzone!',
    },
    reviewReminder: {
      subject: 'Nie zapomnij zostawić opinii!',
      title: 'Przypomnienie o Opinii',
      message: 'Masz 48 godzin na zostawienie opinii o ostatnim spotkaniu.',
      cta: 'Zostaw Opinię',
      notification: 'Nie zapomnij zostawić opinii',
    },
    expiredRequest: {
      subject: 'Twoja prośba wygasła',
      title: 'Prośba Wygasła',
      message: 'Twoja prośba nie otrzymała odpowiedzi i wygasła.',
      refundMessage: 'Twoje tokeny zostały zwrócone.',
      notification: 'Twoja prośba wygasła',
    },
    requestExpiringReminder: {
      subject: 'Twoja prośba wkrótce wygaśnie!',
      title: 'Prośba Wygasa',
      message: 'Masz prośbę, która wygaśnie za godzinę. Odpowiedz zanim będzie za późno!',
      cta: 'Odpowiedz Teraz',
      notification: 'Masz prośbę, która wkrótce wygaśnie',
    },
    appointmentDeadlineReminder: {
      subject: 'Pamiętaj o umówieniu spotkania!',
      title: 'Termin Spotkania',
      message: 'Termin na umówienie spotkania mija za godzinę.',
      cta: 'Umów Teraz',
      notification: 'Umów spotkanie przed terminem',
    },
    verificationReminder: {
      subject: 'Dokończ weryfikację profilu',
      title: 'Weryfikacja Oczekująca',
      maleMessage: 'Nie dokończyłeś jeszcze weryfikacji profilu. Dokończ weryfikację, aby wysyłać prośby.',
      femaleMessage: 'Nie dokończyłaś jeszcze weryfikacji profilu. Dokończ weryfikację, aby otrzymywać prośby.',
      cta: 'Dokończ Weryfikację',
    },
    reviewAction: {
      tokenDeductedSubject: 'Powiadomienie o Koncie',
      tokenDeductedTitle: 'Token Potrącony',
      tokenDeductedMessage: 'W wyniku zgłoszenia token został potrącony z Twojego konta.',
      blockedSubject: 'Konto Zawieszone',
      blockedTitle: 'Konto Zablokowane',
      blockedMessage: 'W wyniku zgłoszeń Twoje konto zostało zawieszone. Skontaktuj się z pomocą techniczną po więcej informacji.',
    },
    chatNotification: {
      title: 'Nowa Wiadomość',
      notification: 'wysłał(a) Ci wiadomość',
    },
  },
};

export function getTranslation(lang: string | null | undefined): typeof translations['it'] {
  const validLang = (lang && lang in translations) ? lang as SupportedLanguage : 'it';
  return translations[validLang];
}

export function getEmailWrapper(content: string, t: typeof translations['it']): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SCOPAMI</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">SCOPAMI</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">${t.common.regards},<br><strong>${t.common.team}</strong></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
