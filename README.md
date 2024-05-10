# sha1-bruteforce

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.8. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Neden

Açıkçası bu sorunun cevabını ben de bilmiyorum. Hashing muhabbetlerine hep bir ilgi duyuyordum zaten ama bu birazcık manyakça oldu, biliyorum. Aklıma geldi, elim boştaydı, dedim bir yapayım. Kod aşırı optimize değil onun da farkındayım ama şu an genel hatlarıyla gayet güzel çalışıyor. MBP M2 Pro CPU ile saniyede 1.3-1.4M arası hash deneyebiliyor. Tabii ki fazla uzun parolaları çözmekte pek efektif değil ama yeterince şanslıysanız neden olmasın.
