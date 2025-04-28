import { id, i, init, InstaQLEntity } from "@instantdb/react";
import { useState } from 'react';
import beaver from './assets/beaver.svg';
import { ApiResponse } from 'shared';

// ID for app: personalDash
// Replace with your own ID!
const APP_ID = "19a9cbb9-2c1b-4591-a5f5-498e93c5803d";
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// Optional: Declare your schema!
const schema = i.schema({
  entities: {
    beavers: i.entity({
      name: i.string(),
      color: i.string(),
      createdAt: i.number(),
    }),
  },
});

type Beaver = InstaQLEntity<typeof schema, "beavers">;

const db = init({ appId: APP_ID, schema });

function App() {
  const [apiData, setApiData] = useState<ApiResponse | undefined>();
  const [showIntro, setShowIntro] = useState(true);

  async function sendRequest() {
    try {
      const req = await fetch(`${SERVER_URL}/hello`);
      const res: ApiResponse = await req.json();
      setApiData(res);
    } catch (error) {
      console.log(error);
    }
  }

  // Read Data
  const { isLoading, error, data } = db.useQuery({ beavers: {} });
  if (isLoading) {
    return;
  }
  if (error) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }
  const { beavers } = data;

  return (
    <div className="font-mono min-h-screen flex justify-center items-center flex-col space-y-4">
      {showIntro && (
        <>
          <div>
            <a href="https://github.com/stevedylandev/bhvr" target="_blank">
              <img src={beaver} className="w-32 h-32 mx-auto" alt="beaver logo" />
            </a>
          </div>
          <h1 className="text-4xl font-bold">bhvr</h1>
          <h2 className="text-2xl">Bun + Hono + Vite + React</h2>
          <p className="mb-4">A typesafe fullstack monorepo</p>
          <div className="mb-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={sendRequest}
            >
              Call API
            </button>
            {apiData && (
              <pre className="mt-2 p-2 bg-gray-100 rounded">
                <code>
                  Message: {apiData.message} <br />
                  Success: {apiData.success.toString()}
                </code>
              </pre>
            )}
            <pre className="mt-4 p-2 bg-gray-100 rounded text-xs">
              <code>
                {`
  .
  ├── client/               # React frontend
  ├── server/               # Hono backend
  ├── shared/               # Shared TypeScript definitions
  │   └── src/types/        # Type definitions used by both client and server
  └── package.json          # Root package.json with workspaces
`}
              </code>
            </pre>
          </div>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setShowIntro(false)}
          >
            Show Beaver Manager
          </button>
        </>
      )}

      {!showIntro && (
        <>
          <button
            className="absolute top-4 left-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setShowIntro(true)}
          >
            Back to Intro
          </button>
          <h2 className="tracking-wide text-5xl text-gray-300">beavers</h2>
          <div className="border border-gray-300 max-w-xs w-full">
            <BeaverForm beavers={beavers} />
            <BeaverList beavers={beavers} />
            <ActionBar beavers={beavers} />
          </div>
          <div className="text-xs text-center">
            Open another tab to see beavers update in realtime!
          </div>
        </>
      )}
    </div>
  );
}

// Write Data
// ---------
function addBeaver(name: string) {
  const randomColor = getRandomColor();
  db.transact(
    db.tx.beavers[id()].update({
      name,
      color: randomColor,
      createdAt: Date.now(),
    })
  );
}

function getRandomColor() {
  const colors = [
    "#8B4513", // Brown
    "#A0522D", // Sienna
    "#CD853F", // Peru
    "#D2691E", // Chocolate
    "#B8860B", // DarkGoldenrod
    "#DAA520", // Goldenrod
    "#F4A460", // SandyBrown
    "#BC8F8F", // RosyBrown
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function deleteBeaver(beaver: Beaver) {
  db.transact(db.tx.beavers[beaver.id].delete());
}

function deleteAllBeavers(beavers: Beaver[]) {
  const txs = beavers.map((beaver) => db.tx.beavers[beaver.id].delete());
  db.transact(txs);
}

// Components
// ----------
function BeaverForm({ beavers }: { beavers: Beaver[] }) {
  return (
    <div className="flex items-center h-10 border-b border-gray-300">
      <form
        className="flex-1 h-full"
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.input as HTMLInputElement;
          if (input.value.trim()) {
            addBeaver(input.value);
            input.value = "";
          }
        }}
      >
        <input
          className="w-full h-full px-2 outline-none bg-transparent"
          autoFocus
          placeholder="Enter a beaver name"
          type="text"
          name="input"
        />
      </form>
    </div>
  );
}

function BeaverList({ beavers }: { beavers: Beaver[] }) {
  return (
    <div className="divide-y divide-gray-300">
      {beavers.map((beaver) => (
        <div key={beaver.id} className="flex items-center h-12">
          <div className="h-full px-2 flex items-center justify-center">
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: beaver.color }}
            />
          </div>
          <div className="flex-1 px-2 overflow-hidden flex items-center">
            <span>{beaver.name}</span>
          </div>
          <button
            className="h-full px-2 flex items-center justify-center text-gray-300 hover:text-gray-500"
            onClick={() => deleteBeaver(beaver)}
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
}

function ActionBar({ beavers }: { beavers: Beaver[] }) {
  return (
    <div className="flex justify-between items-center h-10 px-2 text-xs border-t border-gray-300">
      <div>Total beavers: {beavers.length}</div>
      <button
        className="text-gray-300 hover:text-gray-500"
        onClick={() => deleteAllBeavers(beavers)}
      >
        Delete All Beavers
      </button>
    </div>
  );
}

export default App;