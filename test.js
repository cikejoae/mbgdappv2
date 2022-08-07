const axios = require("axios");
const NFTCONTRACT = "0xA690c89558a39709e1F0DdE0f8825a83d438fcE4";
const moralisapi = "https://deep-index.moralis.io/api/v2";
const moralisapikey = "JwcyI3kFcZIx9M9Psom0b0d2ahdb9VxmSs80MnYU43bbwX803Jufh0XzqYKbXzyg";
let owners = [];
let cursor = "";

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

async function getOwners() {
    do{
        await sleep(100);
        let config = { 'X-API-Key': moralisapikey, 'accept': 'application/json' };
        await axios.get((moralisapi + `/nft/${NFTCONTRACT}/owners?chain=polygon&format=decimal&limit=100&cursor=${cursor}`), { headers: config })
            .then(response => {
                const res = response.data;
                console.log(
                    `Got page ${res.page} of ${Math.ceil(
                        res.total / res.page_size
                    )}, ${res.total} total`
                );

                for (const owner of res.result) {
                    owners.push({
                        id: owner.token_id,
                        owner: owner.owner_of,
                    });
                }

                cursor = res.cursor;
            })

    } while (cursor != "" && cursor != null);

    console.log(owners);
}

getOwners();