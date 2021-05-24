import axios from 'axios';

export const getAccessToken = async ({ username, password, url }: {
  username: string;
  password: string;
  url: string;
}) => {
  const response = await axios({
    method: 'post',
    url,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      query: `query ($username: String!, $password: String!) {
                auth(username: $username, password: $password) {
                  status
                  errorSummary
                  errorText
                  errorDetails
                  companyId     
                }
              }`,
      variables: {
        username,
        password,
      },
    },
  });
  const accessToken = response.headers['set-cookie'][0]
    .split(';')[0]
    .split('=')[1];

  return accessToken;
};
