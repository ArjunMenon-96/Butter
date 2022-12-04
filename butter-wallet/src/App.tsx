import React from "react";
import {useState, useEffect} from "react";
import Butter from './contracts/Butter.json';
import Registry from './contracts/Registry.json';
import { makeStyles } from "@material-ui/core/styles";
import { useSmartAccountContext } from "./contexts/SmartAccountContext";
import { useWeb3AuthContext, Web3AuthProvider } from "./contexts/SocialLoginContext";
import Button from "./components/Button";
import * as ethers from "ethers";
import SmartAccount from "@biconomy/smart-account";
import { supportedChains, activeChainId } from "./utils/chainConfig";


type Dummy = { [key: string]: any }
type ISmartAccount = {
  version: string;
  smartAccountAddress: string;
  isDeployed: boolean;
};
const registryContractAddress = '0x8582f3B4CFd18b8FA66A352AE25F6D2DC2A359e3'
const butterContractAddress = '0x4b13f9dc031A77DD3C411A3D6b8e3442b05c8F0a'


const App: React.FC = () => {
  const classes = useStyles();
  const temp:Dummy = {};
  // const temp2:ISmartAccount = {}
  const [tDefaultAddress, setTDefaultAddress] = useState('');
  const [butterContract, setButterContract] = useState(temp);
  const [registryContract, setRegistryContract] = useState(temp);
  const [hasVault, setHasVault] = useState(false);
  const [vaultLoaded, setVaultLoaded] = useState(false);
  const [alprovider, alsetProvider] = useState(temp);
  const [wallet, setWallet] = useState(temp);

  const {
    address,
    loading: eoaLoading,
    connect,
    disconnect,
    ethersProvider,
    provider
  } = useWeb3AuthContext();
  const {
    selectedAccount,
    loading: scwLoading,
    setSelectedAccount,
    // wallet
  } = useSmartAccountContext();

  useEffect(() => {
    const init = async () => {
      const nodeProvider = 'https://polygon-mumbai.g.alchemy.com/v2/l5W0BrhnZRPFhU36qkFXO6Gtppdr72Zu'
      const alprovider:any = new ethers.providers.JsonRpcProvider(nodeProvider)

      const contractButter:Dummy = new ethers.Contract(
        butterContractAddress,
        Butter.abi,
        alprovider
      );

      const contractRegistry:Dummy = new ethers.Contract(
        registryContractAddress,
        Registry.abi,
        alprovider
      );
      alsetProvider(alprovider)
      setButterContract(contractButter);
      setRegistryContract(contractRegistry);
    }
    init();    

  }, []);

    const dontDo = async function(){}

    const loadVault = async function(){
      const check = await registryContract.vaultMapping(address)
      if(!check.startsWith('0x0000000000000000000000000000000000000000'))
        setHasVault(true)  

      const walletProvider = new ethers.providers.Web3Provider(provider);
      console.log("walletProvider", walletProvider);
      // New instance, all config params are optional
      const wallet = new SmartAccount(walletProvider, {
        activeNetworkId: activeChainId,
        supportedNetworksIds: supportedChains,
        networkConfig: [
          {
            chainId: 80001,
            dappAPIKey: "59fRCMXvk.8a1652f0-b522-4ea7-b296-98628499aee3",
          }
        ],
      });
      console.log("wallet", wallet);

      setVaultLoaded(true)    
      setWallet(wallet)
    }

    const deployVault = async function(e:any) {
      e.preventDefault();
      console.log('tryong to delkgt');

      console.log(wallet);
      const vaultName = e.target.elements[0].value;

      const dappInterface = new ethers.utils.Interface(Registry.abi);
      debugger;
      const data1 = dappInterface.encodeFunctionData(
        'addVaultToUser', [vaultName]
      )
      const tx1 = {
        to: registryContractAddress,
        data: data1
      }
      const txns = [tx1]

      const response = await wallet?.sendGaslessTransactionBatch({ transactions: txns })
      debugger
      // await registryContract.addVaultToUser(vaultName)
    }

    const addToVault = async function(e:any) {
      e.preventDefault();
      const amountInEth = e.target.elements[0].value;
      const to = registryContractAddress;
      await transferNative(amountInEth, to)
    }

    const transferFromVault = async function(e:any) {
      e.preventDefault();
      const to = e.target.elements[0].value;
      const amountInEth = e.target.elements[1].value;
      const amountInWei = ethers.utils.parseEther(amountInEth)
      await butterContract.sentEth(amountInWei, to)
    }

  const populateMyAddress = function(){
    tDefaultAddress == '' ? setTDefaultAddress(address) : setTDefaultAddress('')
  }

  const transferNative = async function(amountInEth:any, to:any){
    try {
      const signer = provider.getSigner();
      const _value = ethers.utils.parseEther(amountInEth);
      const tx = {
        to: to,
        value: _value,
        gasLimit: 21000
      };
 
      const txn = await signer.sendTransaction(tx);
      return txn;
    } catch (err) {
      throw err;
    }
  }



  return (
    <div className={classes.bgCover}>
      <main className={classes.container}>
        <h1></h1>
        <Button
          onClickFunc={
            !address
              ? connect
              : () => {
                  setSelectedAccount(null);
                  disconnect();
                }
          }
          title={!address ? "Connect Wallet" : "Disconnect Wallet"}
        />
        
       {address && <Button
          style= {{'marginRight':"200px"}}
          onClickFunc={loadVault}
          title="Load Vault"
        />}

        {eoaLoading && <h2 style={{"marginRight":"700px"}}>Fetching address...</h2>}

        {address && (
          <div>
            <h3 style={{marginTop: '45px', "marginLeft":"20px"}}> User Address : {address}</h3>
          </div>
        )}

          { vaultLoaded && !hasVault && <div style={{"marginTop":"150px"}} className="row">
            <div className="col-sm-8">
              <h2>Deploy a vault</h2> <br/>
              <form onSubmit={e => deployVault(e)}>
                <div className="form-group col-sm-5" style={{float:"left"}}>
                  <label htmlFor="name" style={{fontWeight:"bold"}}> Vault name : </label>
                  <input type="text" className="form-control" id="name" autoComplete="off"/>
                </div>
                  <br/> <button type="submit" className="btn btn-primary" style={
                    {
                      float:"left", 
                      "marginTop":"10px", 
                      width: "150px", 
                      background: "#eed202",
                      cursor: "pointer",
                      borderRadius: 5,
                      outline: "none",
                      border: 0,
                      boxShadow: "2px 2px #3E497A",
                      lineHeight: "25px",
                      padding: "0px 12px" 
                    }}> Deploy vault </button> 
              </form>
            </div>
          </div> }

          {address && vaultLoaded && hasVault && <div> 
            <div style={{"marginTop":"150px", "marginLeft":"80px",}} className="row">
              <div className="col-sm-8">
                <h2>Add tokens to vault</h2> <br/>
                <form onSubmit={e => addToVault(e)}>
                  <div className="form-group col-sm-5" style={{float:"left"}}>
                    <label htmlFor="aamount" style={{fontWeight:"bold"}}> Token amount : </label>
                    <input type="number" className="form-control" id="aAmount" autoComplete="off"/>
                  </div>
                    <br/> <button type="submit" className="btn btn-primary" style={
                      {
                        float:"left", 
                        "marginTop":"10px", 
                        "marginLeft":"10px",
                        width: "150px", 
                        background: "#eed202",
                        cursor: "pointer",
                        borderRadius: 5,
                        outline: "none",
                        border: 0,
                        boxShadow: "2px 2px #3E497A",
                        lineHeight: "25px",
                        padding: "0px 12px" 
                      }}> add to vault </button> 
                </form>
              </div>
            </div> 

            <div style={{"marginTop":"150px", "marginLeft":"80px",}} className="row">
              <div className="col-sm-8">
                <h2>Withdraw tokens</h2> <br/>
                <form onSubmit={e => transferFromVault(e)}>
                  <div className="form-group col-sm-5" style={{float:"left"}}>
                    <label htmlFor="taddress" style={{fontWeight:"bold"}}> Recipient Address : </label>
                    <input type="text" className="form-control" id="tAddress" onChange={dontDo} value={tDefaultAddress}  autoComplete="off"/>
                  </div> <br/>
                  <div className="form-group col-sm-5" style={{float:"left", "marginTop":"10px"}}>
                    <label htmlFor="tamount" style={{fontWeight:"bold"}}> Token amount : </label>
                    <input type="number" className="form-control" id="tAmount" autoComplete="off"/>
                  </div>
                    <br/> <button onClick={populateMyAddress} className="btn btn-primary" style={
                      {
                        float:"left", 
                        "marginTop":"10px", 
                        width: "150px", 
                        background: "#eed202",
                        cursor: "pointer",
                        borderRadius: 5,
                        outline: "none",
                        border: 0,
                        boxShadow: "2px 2px #3E497A",
                        lineHeight: "25px",
                        padding: "0px 12px",
                      }}> {!tDefaultAddress ? "Send it to myself" : "Change address"} </button>
                      <button type="submit" className="btn btn-primary" style={
                      {
                        float:"left", 
                        "marginTop":"10px", 
                        width: "150px", 
                        background: "#eed202",
                        cursor: "pointer",
                        borderRadius: 5,
                        outline: "none",
                        border: 0,
                        boxShadow: "2px 2px #3E497A",
                        lineHeight: "25px",
                        padding: "0px 12px",
                        "marginLeft": "10px"
                      }}> transfer tokens </button> 
                </form>
              </div>
            </div> 
          </div>}

        {/* {scwLoading && <h2>Loading Smart Account...</h2>}

        {selectedAccount && address && (
          <div>
            <h2>Smart Account Address</h2>
            <p>{selectedAccount.smartAccountAddress}</p>
          </div>
        )} */}

        {/* {address && (
          <Button onClickFunc={() => getUserInfo()} title="Get User Info" />
        )} */}

        {/* {userInfo && (
          <div style={{ maxWidth: 800, wordBreak: "break-all" }}>
            <h2>User Info</h2>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(userInfo, null, 2)}
            </pre>
          </div>
        )} */}
      </main>
    </div>
  );
};



const useStyles = makeStyles(() => ({
  bgCover: {
    backgroundColor: "#ffff66",
    backgroundSize: "cover",
    width: "100%",
    minHeight: "100vh",
    // fontStyle: "italic",
  },
  container: {
    display: "flex",
    // flexDirection: "column",
    // width: "100%",
    minHeight: "80vh",
    height: 'auto',
    justifyContent: "right",
    alignItems: "right",
    "margin-right": "190px",
    "font-size": "0.8rem"
  },
  title: {
    // marginBottom: 50,
    // fontSize: 60,
    background: "linear-gradient(90deg, #12ECB8 -2.21%, #00B4ED 92.02%)",
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
  },
  animateBlink: {
    animation: "$bottom_up 2s linear infinite",
    "&:hover": {
      transform: "scale(1.2)",
    },
  },
  "@keyframes bottom_up": {
    "0%": {
      transform: "translateY(0px)",
    },
    "25%": {
      transform: "translateY(20px)",
    },
    "50%": {
      transform: "translateY(0px)",
    },
    "75%": {
      transform: "translateY(-20px)",
    },
    "100%": {
      transform: "translateY(0px)",
    },
  },
}));

export default App;
