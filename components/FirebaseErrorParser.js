/* -------------------- FirebaseErrorParser -------------------- */
export default function FirebaseErrorParser(error) {
  let message = "An unknown error occurred.";

  /* -------------------- Firebase Error Codes -------------------- */
  if (error && error.code) {
    switch (error.code) {
      case "auth/invalid-email":
        message = "The email address is badly formatted.";
        break;
      case "auth/user-disabled":
        message = "This user account has been disabled.";
        break;
      case "auth/user-not-found":
        message = "No user found with this email.";
        break;
      case "auth/wrong-password":
        message = "Incorrect password. Please try again.";
        break;
      case "auth/email-already-in-use":
        message = "The email address is already in use by another account.";
        break;
      case "auth/weak-password":
        message = "The password is too weak. Please choose a stronger password.";
        break;
        case "auth/network-request-failed":
        message = "Network error. Please check your internet connection and try again.";
        break;
        case "auth/too-many-requests":
        message = "Too many unsuccessful login attempts. Please try again later.";
        break;
        case "auth/invalid-password":
        message = "The password is invalid or the user does not have a password.";
        break;
        case "auth/operation-not-allowed":
        message = "This operation is not allowed. Please contact support.";
        break;
        case "auth/expired-action-code":
        message = "The action code has expired. Please request a new one.";
        break;
        case "auth/invalid-action-code":
        message = "The action code is invalid. Please request a new one.";
        break;
        case "auth/missing-email":
        message = "An email address is required.";
        break;
        case "auth/invalid-email-verified":
        message = "The email address is not verified.";
        break;
        case "auth/requires-recent-login":
        message = "Please log in again to perform this operation.";
        break;
        case "auth/provider-already-linked":
        message = "This provider is already linked to the user.";
        break;
        case "auth/no-such-provider":
        message = "No such provider is linked to the user.";
        break;
        case "auth/credential-already-in-use":
        message = "This credential is already associated with a different user account.";
        break;
        case "auth/invalid-credential":
        message = "The supplied credential is malformed or has expired.";
        break;
        case "auth/invalid-verification-code":
        message = "The verification code is invalid.";
        break;
        case "auth/invalid-verification-id":
        message = "The verification code is invalid.";
        break;
        case "auth/too-many-requests":
        message = "Too many unsuccessful login attempts. Please try again later.";
        break;
        case "auth/invalid-verification-code":
        message = "The verification code is invalid.";
        break;
      default:
        message = error.message || message;
    }
  }

  return message;
}