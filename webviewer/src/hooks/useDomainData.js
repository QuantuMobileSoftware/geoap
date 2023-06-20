import { useState, useEffect } from 'react';
import defaultLogoSvg from 'assets/images/logo.svg';
import agrieosLogoPng from 'assets/images/agrieos-logo.png';

const domain_dict = {
  'agrieos.in': {
    name: 'Agrieos',
    logo: agrieosLogoPng
  },
  'portal.soilmate.ai': {
    name: 'SoilMate',
    logo: defaultLogoSvg
  },
  default: {
    name: 'GeoAP',
    logo: defaultLogoSvg
  }
};

export const useDomainData = () => {
  const [titleName, setTitleName] = useState(domain_dict.default.name);
  const [logo, setLogo] = useState(domain_dict.default.logo);
  useEffect(() => {
    const hostName = window.location.hostname;
    if (hostName in domain_dict) {
      setTitleName(domain_dict[hostName].name);
      setLogo(domain_dict[hostName].logo);
    }
  }, []);
  return { titleName, logo };
};
