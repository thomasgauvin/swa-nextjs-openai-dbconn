import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const joke = req.body.joke || '';
  if (joke.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid Azure service",
      }
    });
    return;
  }

  try {

    const messages= [
      {"role": "system", "content": "Suggest a lighthearted joke for the Azure service."},
      {"role": "user", "content": "Azure Web Apps"},
      {"role": "assistant", "content": "Why was the Azure Web App out of breath? Because it was always running in the cloud!"},
      {"role": "user", "content": "Azure Static Web Apps"},
      {"role": "assistant", "content": "Why did the Azure static web app go to the store? Because it was out of HTML!"},
      {"role": "user", "content": "Azure App Service"},
      {"role": "assistant", "content": "Why couldn't the Azure Web App go to the party? Because it was always busy serving requests!"},
      {"role": "user", "content": "Azure Synapse"},
      {"role": "assistant", "content": "Why did the data analyst go swimming in Azure Synapse?"},
    ]

    messages.push({
      "role": "user",
      "content": joke
    })

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    console.log(completion.data.choices[0].message.content)
    res.status(200).json({ result: completion.data.choices[0].message.content });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}
