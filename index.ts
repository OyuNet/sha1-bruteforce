import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { createHash } from "crypto";
import { config } from "dotenv";

config();

const targetHash: any = process.env.targetHash;

const sha1 = (text: string) => {
  const shasum = createHash("sha1");
  shasum.update(text);
  return shasum.digest("hex");
};

const characters: any = process.env.characters;

let totalAttempts = 0;
let startTime = 0;
let lastUpdateTime = 0;
let lastAttempts = 0;
let lastPassword = "";
let lastHash = "";

const updateStats = (currentAttempts: number) => {
  const currentTime = Date.now();
  const elapsedTime = (currentTime - startTime) / 1000; // Geçen süre saniye cinsinden
  const elapsedSinceLastUpdate = (currentTime - lastUpdateTime) / 1000; // Son güncellemeden geçen süre saniye cinsinden

  console.clear(); // Konsolu temizle
  console.log(`Geçen süre: ${elapsedTime.toFixed(2)} saniye`);
  console.log(`Toplam deneme sayısı: ${currentAttempts}`);
  console.log(
    `Saniyedeki deneme sayısı: ${((currentAttempts - lastAttempts) / elapsedSinceLastUpdate).toFixed(2)}`,
  );
  console.log(`Son denenen parola: ${lastPassword}`);
  console.log(`Son denenen parolanın hash'i: ${lastHash}`);

  lastUpdateTime = currentTime;
  lastAttempts = currentAttempts;
};

const generateRandomPassword = (length: number) => {
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }
  return password;
};

const bruteForce = (startLength: number, endLength: number) => {
  startTime = Date.now();
  lastUpdateTime = startTime;

  for (let length = startLength; length <= endLength; length++) {
    const maxLength = characters.length ** length;
    while (totalAttempts < maxLength) {
      totalAttempts++;
      const password = generateRandomPassword(length);
      lastPassword = password;
      lastHash = sha1(password);
      if (lastHash === targetHash) {
        return {
          password: lastPassword,
          hash: lastHash,
          attempts: totalAttempts,
        };
      }

      if (totalAttempts % 1000000 === 0) {
        updateStats(totalAttempts);
      }
    }
  }
  return null;
};

if (isMainThread) {
  const threadCount: any = process.env.threads;
  const numThreads: number = parseInt(threadCount);
  const threads: any[] = [];
  let foundResult = false;

  const min: any = process.env.minLength;
  const minLength: number = parseInt(min);
  const max: any = process.env.maxLength;
  const maxLength: number = parseInt(max);
  const chunkSize = Math.ceil((maxLength - minLength + 1) / numThreads);

  for (let i = 0; i < numThreads; i++) {
    const startLength = minLength + i * chunkSize;
    const endLength = Math.min(minLength + (i + 1) * chunkSize - 1, maxLength);
    const worker = new Worker(__filename, {
      workerData: { startLength, endLength },
    });
    worker.on("message", (result) => {
      if (result) {
        console.log(`Hash bulundu: ${result.hash}`);
        console.log(`Parola: ${result.password}`);
        console.log(`Toplam deneme sayısı: ${result.attempts}`);
        threads.forEach((thread) => thread.terminate());
        foundResult = true;
      }
    });
    worker.on("exit", () => {
      if (!foundResult && threads.every((thread) => thread.exited)) {
        console.log("Hash bulunamadı.");
      }
    });
    threads.push(worker);
  }
} else {
  const { startLength, endLength } = workerData;
  const result = bruteForce(startLength, endLength);
  if (result) {
    if (parentPort) {
      parentPort.postMessage(result);
    }
  }
}
