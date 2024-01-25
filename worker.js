addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request, env, ctx) {
  let sites = [
    { url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/hysteria2/config.json', type: "hysteria2" },
    { url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/hysteria2/1/config.json',type: "hysteria2" },
    { url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/hysteria2/2/config.json',type: "hysteria2"},
    { url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/hysteria2/13/config.json',type: "hysteria2"},
    { url: 'https://gitlab.com/free9999/ipupdate/-/raw/master/hysteria2/config.json',type: "hysteria2"},
    { url: 'https://gitlab.com/free9999/ipupdate/-/raw/master/hysteria2/2/config.json',type: "hysteria2"},
    { url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/hysteria/config.json', type: "hysteria" },
    { url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/hysteria/1/config.json',type: "hysteria" },
    { url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/hysteria/2/config.json',type: "hysteria"},
    { url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/hysteria/13/config.json',type: "hysteria"},
    { url: 'https://gitlab.com/free9999/ipupdate/-/raw/master/hysteria/config.json',type: "hysteria"},
    { url: 'https://gitlab.com/free9999/ipupdate/-/raw/master/hysteria/2/config.json',type: "hysteria"},
  ];

  let responses = [];
  for (const site of sites) {
    try {
      let response = await fetch(site.url);
      if (response.ok) {
        let data = await response.json();
        let processedData = await processHysteria2(data);
        if (processedData) {
          responses.push(processedData);
        }
      } else {
        console.error(`Failed to fetch data from ${site.url}, status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error fetching data from ${site.url}:`, error);
      continue;
    }
  }

  const combinedString = responses.join('\n');
  const base64EncodedString = btoa(unescape(encodeURIComponent(combinedString)));

  return new Response(base64EncodedString, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

async function processHysteria2(data) {
  const auth = data.auth || '';
  const server = data.server || '';
  const insecure = data.tls.insecure ? 1 : 0;
  const sni = data.tls.sni || '';
  const match = server.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
  const ip = match ? match[0] : null;
  if (ip) {
    const locationInfo = await getLocationInfo(ip);
    const locationInfoEncoded = encodeURIComponent(locationInfo);
    return `hy2://${auth}@${server}?insecure=${insecure}&sni=${sni}#${locationInfoEncoded}`;
  }
  return null;
}

async function getLocationInfo(ip) {
  try {
    let response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
    if (response.ok) {
      let data = await response.json();
      if (data.status === "success") {
        return `${data.country} ${data.regionName} ${data.as}`;
      }
    }
  } catch (error) {
    console.error(`Error fetching location data for IP ${ip}:`, error);
  }
  return '';
}
