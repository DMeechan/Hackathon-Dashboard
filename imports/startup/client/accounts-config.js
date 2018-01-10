import { check } from 'meteor/check';

var pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
const errorMessage = "Invalid email. Please enter a valid email";
AccountsTemplates.addFields([
  {
    _id: "name",
    type: "text",
    displayName: "Name",
    required: true,
    minLength: 1,
  },
  {
      _id: "email",
      type: "email",
      displayName: "Email",
      required: true,
      minLength: 8,
      func: function(email) {
        check(email, String);
        const self = this;

        // <=!=> SKIP THE DOMAIN VALIDATION PROCESS UNTIL THIS IS BUILT INTO SETTINGS.JSON
        return true // Allow any email domain and skip validation
        // <=!=>

        const acceptedEmailDomains = [
          "google.com",
          "microsoft.com",
          "ibm.com"
        ];

        for (i = 0; i < acceptedEmailDomains.length; i++) {
          const domain = acceptedEmailDomains[i];
          if (email.includes(domain)) {
            self.setSuccess();
            return false // Success
          }
        }

        console.log('No email match found')

        self.setValidating(false);
        console.log(errorMessage);
        self.setError(errorMessage);
        return true // Validation error
      },
    errStr: errorMessage
  },
  pwd
]);

AccountsTemplates.configure({
  // Behavior
  confirmPassword: true,
  enablePasswordChange: true,
  forbidClientAccountCreation: false,
  overrideLoginErrors: false,
  sendVerificationEmail: false,
  lowercaseUsername: false,
  focusFirstInput: true,

  // Appearance
  showAddRemoveServices: false,
  showForgotPasswordLink: true,
  showLabels: true,
  showPlaceholders: true,
  showResendVerificationEmailLink: false,

  // Client-side Validation
  continuousValidation: false,
  negativeFeedback: true,
  negativeValidation: true,
  positiveValidation: true,
  positiveFeedback: true,
  showValidating: true,

  // Privacy Policy and Terms of Use
  // privacyUrl: 'privacy',
  // termsUrl: 'terms-of-use',

  // Redirects
  homeRoutePath: '/events',
  redirectTimeout: 4000,

  // Hooks
  // onLogoutHook: myLogoutFunc,
  // onSubmitHook: mySubmitFunc,
  // preSignUpHook: validateEmail,
  // postSignUpHook: myPostSubmitFunc,

  // Texts
  texts: {
    button: {
      signUp: "Register"
    },
    inputIcons: {
      isValidating: "fa fa-spinner fa-spin",
      hasSuccess: "fa fa-check",
      hasError: "fa fa-times",
    }
  },
});
