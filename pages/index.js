import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [jokeInput, setjokeInput] = useState("");
  const [result, setResult] = useState();
  const [allJokes, setAllJokes] = useState([]);

  //load all jokes from db on mount
  useEffect(() => {
    getJokes();
  }, [])


  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ joke: jokeInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  async function onSaveResults(){
    //make post request to /data-api/rest/JokeName
    //with body of {joke_name: result, joke_type: jokeInput}
    //then fetch all jokes again
    try {
      //parse all jokenames from result which is a comma separate string
      const jokeNames = result.split(",");
      //loop through each jokename and make a post request to /data-api/rest/JokeName
      //with body of {joke_name: jokeName, joke_type: jokeInput}
      for(const jokeName of jokeNames){
        await PostJokeName(jokeName, jokeInput);
      }

      setjokeInput("");
      getJokes();
      setResult();

    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }

  }

  //fetch all jokes from db with /data-api/JokeNames
  //set result to all jokes
  async function getJokes() {
    const response = await fetch("/data-api/rest/Joke");
    const data = await response.json();
    setAllJokes(data.value);
  }

  async function PostJokeName(result, jokeInput){
    const response = await fetch("/data-api/rest/Joke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MS-API-ROLE": "admin"
      },
      body: JSON.stringify({ azure_service: jokeInput, joke: result }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw data.error || new Error(`Request failed with status ${response.status}`);
    }
  }

  async function onDelete(id){
    const response = await fetch(`/data-api/rest/Joke/id/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-MS-API-ROLE": "admin"
      }
    });

    getJokes();
  }


  return (
    <div>
      <Head>
        <title>SWA, OpenAI Quickstart</title>
        <link rel="icon" href="/azure.png" />
      </Head>

      <main className={styles.main}>
        <div style={{display: 'flex', alignItems: 'center', margin: '2em'}}>
          <img src="/azure.png" style={{marginRight: '2em', height: '48px', width: '48px'}} />
          <h3 style={{margin: 0}}>Azure jokes!</h3>
        </div>

        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="joke"
            placeholder="Enter an Azure service"
            value={jokeInput}
            onChange={(e) => setjokeInput(e.target.value)}
          />
          <input type="submit" value="Generate joke" />
        </form>

        {result && (
            <div class="max-w-sm rounded overflow-hidden shadow-lg p-4 px-8 border-gray-400 border m-4">
              <div className={styles.result}>{result}</div>
              <div className="min-w-min m-auto py-2">
                <button onClick={()=>onSaveResults()} >Save results</button>
              </div>
            </div>
          )
        }

      {allJokes && allJokes.length > 0 && 
        <div className="max-w-7xl m-8">
          <h3 style={{textAlign: 'center'}}>All jokes</h3>
          <div className="flex flex-wrap content-start m-auto justify-around">
            { allJokes.map((joke) => (
              <div class="max-w-sm rounded overflow-hidden shadow-lg p-4 px-8 border-gray-400 border m-4 basis-1/2 sm:basis-full">
                <div className={styles.result} style={{fontWeight: 700}}>{joke.azure_service}</div>
                <div className={styles.result}>{joke.joke}</div>
                <div className="min-w-min m-auto py-2">
                  <button onClick={()=>onDelete(joke.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      </main>
    </div>
  );
}
