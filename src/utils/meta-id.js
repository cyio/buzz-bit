const metaIdUtils = {};

metaIdUtils.buildMetaData = function (publicKey, parentTxid, node_name, data = 'NULL', encrypt = 'NULL', version = 'NULL', data_type = 'NULL', encoding = 'NULL') {
    if (data === "")
        data = "NULL";
    if (encrypt === "")
        encrypt = "NULL";
    if (version === "")
        version = "NULL";
    if (data_type === "")
        data_type = "NULL";
    if (encoding === "")
        encoding = "NULL";
    return [
        "meta",
        publicKey + "",
        parentTxid + "",
        "MetaID",
        node_name + "",
        data + "",
        encrypt + "",
        version + "",
        data_type + "",
        encoding + ""
    ]
}


metaIdUtils.buildBuzz = function({ buzzData, newNodePublicKey, parentTxId, encrypt = '0' }) {
    const nodeName = 'SimpleMicroblog-9e73d8935669'
    return metaIdUtils.buildMetaData(
        newNodePublicKey,
        parentTxId,
        nodeName,
        JSON.stringify(buzzData),
        encrypt,
        "1.0.2",
        "application/json",
        "utf-8"
    )
}

// walletManager 只能在钱包插件中使用
// async function send(data) {
//     let txid = (await window.sensilet.walletManager.sendOpReturn(data)).tx.id;
//     return txid;
// }

// metaIdUtils.sendBuzz = async function ({buzzData}) {
//     let dataTxid = await send(buzzData).catch(e => console.log(e))
//     console.log('send buzz success: ', {dataTxid})
//     return dataTxid
// } 

export default metaIdUtils