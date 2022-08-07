const Moralis = require("moralis/node");
const serverUrl = "https://punnpcgkji6n.usemoralis.com:2053/server";
const appId = "vAJFzu18W742DdLE5jYG8wtKWfG4lnWhRrr1Ymxq";
const contractAddress = "0xA690c89558a39709e1F0DdE0f8825a83d438fcE4";
function sleep(ms) {return new Promise((resolve) => setTimeout(resolve, ms));}
async function getAllOwners() {
  await Moralis.start({ serverUrl: serverUrl, appId: appId });
  let cursor = null;
  let owners = {};
  do {
    await sleep(250);
    const response = await Moralis.Web3API.token.getNFTOwners({
      address: contractAddress,
      chain: "polygon",
      limit: 100,
      cursor: cursor,
    });
    console.log(
      `Got page ${response.page} of ${Math.ceil(
        response.total / response.page_size
      )}, ${response.total} total`
    );
    for (const owner of response.result) {
      owners[owner.owner_of] = {
        amount: owner.amount,
        owner: owner.owner_of,
        tokenId: owner.token_id,
        tokenAddress: owner.token_address,
      };
    }
    cursor = response.cursor;
  } while (cursor != "" && cursor != null);

  console.log("owners:", owners, "total owners:", Object.keys(owners).length);
}

getAllOwners();