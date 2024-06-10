const errorManifest = {
    generic: {
        serverError: {
            summary: "There was an error processing your request. Please try again."
        }
    },
    validation: {
        default: {
            summary: "Your request contains validation errors",
            inline: "Your request contains validation errors"
        },
        email: {
            blank: {
                summary: "Enter an email address",
                inline: "Enter an email address"
            },
            incorrect: {
                summary: "Email is not valid",
                inline: "Enter an email address in the correct format, like name@example.com"
            }
        },
        companyName: {
            blank: {
                summary: "Enter a company name",
                inline: "Enter a company name"
            },
            incorrect: {
                summary: "Company name is not valid",
                inline: "Enter a valid company name"
            }
        },
        description: {
            blank: {
                summary: "Enter a company description",
                inline: "Enter a company description"
            },
            incorrect: {
                summary: "Company description is not valid",
                inline: "Enter a valid company description; 120 max characters"
            }
        }
    }
};

export default errorManifest;
