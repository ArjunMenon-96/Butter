import React from "react";
import {useState, useEffect} from "react";
import Butter from './contracts/Butter.json';
import Registry from './contracts/Registry.json';
import { makeStyles } from "@material-ui/core/styles";
import { useSmartAccountContext } from "./contexts/SmartAccountContext";
import { useWeb3AuthContext } from "./contexts/SocialLoginContext";
import Button from "./components/Button";
import * as ethers from "ethers";

type Dummy = {
  [key: string]: any;
}

const App: React.FC = () => {
  const classes = useStyles();
  const temp:Dummy = {}
  const temp2:Dummy = {}
  const [tDefaultAddress, setTDefaultAddress] = useState('');
  const [butterContract, setButterContract] = useState(temp);
  const [registryContract, setRegistryContract] = useState(temp);
  const [hasVault, setHasVault] = useState(false);
  const [vaultLoaded, setVaultLoaded] = useState(false);
  const [provider, setProvider] = useState(temp);

  const {
    address,
    loading: eoaLoading,
    connect,
    disconnect,
  } = useWeb3AuthContext();
  const {
    loading: scwLoading,
    setSelectedAccount,
  } = useSmartAccountContext();

  useEffect(() => {
    const init = async () => {

      const nodeProvider = 'https://polygon-mumbai.g.alchemy.com/v2/l5W0BrhnZRPFhU36qkFXO6Gtppdr72Zu'
      const provider:any = new ethers.providers.JsonRpcProvider(nodeProvider)

      const contractButter:Dummy = new ethers.Contract(
        '0x4b13f9dc031A77DD3C411A3D6b8e3442b05c8F0a',
        Butter.abi,
        provider
      );

      const contractRegistry:Dummy = new ethers.Contract(
        '0x9E69bd02A4C92ae1fF9e4D0D7eB01d2d3b50b35e',
        Registry.abi,
        provider
      );
      setProvider(provider)
      setButterContract(contractButter);
      setRegistryContract(contractRegistry);
    }
    init();
    
  }, []);

    const dontDo = async function(){}

    const loadVault = async function(){
      console.log('loading vaultttttt');
      console.log(registryContract);
      
      const check = await registryContract.vaultMapping(address)
      console.log('contract calllllllllllllll');
      console.log(check);
      if(!check.startsWith('0x0000000000000000000000000000000000000000'))
        setHasVault(true)
      
    }

    const deployVault = async function(e:any) {
      e.preventDefault();
      const vaultName = e.target.elements[0].value;
    }

    const addToVault = async function(e:any) {
      e.preventDefault();
      const amountInEth = e.target.elements[0].value;
      const to = '0x4b13f9dc031A77DD3C411A3D6b8e3442b05c8F0a'
      await transferNative(amountInEth, to)
    }

  const transferFromVault = async function(e:any) {
    e.preventDefault();
    const to = e.target.elements[0].value;
    const amountInEth = e.target.elements[1].value;
    await butterContract.sentEth(amountInEth).send({accounts:address})
    
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

          { !hasVault && <div style={{"marginTop":"150px"}} className="row">
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

          {address && hasVault && <div> 
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
