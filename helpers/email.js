exports.registerEmailParams = (email, token) => {
  return {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: [email],
    },
    ReplyToAddresses: [process.env.EMAIL_TO],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<html>
              
                <h1 style='color:red;'>
                  Verify your email address
                </h1>
                <p>Please use the following link to complete your registration.</p>
                <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
            </html>`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Complete your registration",
      },
    },
  };
};

exports.forgotEmailPasswordParams = (email, token) => {
  return {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: [email],
    },
    ReplyToAddresses: [process.env.EMAIL_TO],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<html>
              
                <h1 style='color:red;'>
                  Reset Password Link
                </h1>
                <p>Please use the following link to reset your password.</p>
                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
            </html>`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Reset your password",
      },
    },
  };
};

//linkPublishedParams
exports.linkPublishedParams = (email, data) => {
  return {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: [email],
    },
    ReplyToAddresses: [process.env.EMAIL_TO],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<html>
              
                <h1 style='color:red;'>
                 New link published | reactnodeaws.com
                </h1>
                <p>A new link titled <b>${
                  data.title
                }</b> has been published in the following categories.</p>
                ${data.categories
                  .map((c) => {
                    return `
                    <div>
                      <h2>${c.name}</h2>
                      <img src="${c.image.url}" alt="${c.name}" style="{height:50px}"/>
                      <h3>
                      <a href="${process.env.CLIENT_URL}/links/${c.slug}">Check it out!</a>
                      </h3>
                    </div>
                  `;
                  })
                  .join("--------------------")}
                <br/>
                <p>Do not want to receive notification?</p>
                <p>Turn off notification by ging to your <b>dashboard</b> <b>update profile</b> and <b>uncheck</b> categories</p>
                <p>${process.env.CLIENT_URL}/user/profile/update</p>
            </html>`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "New Link Publish",
      },
    },
  };
};
