import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveReferralCode } from '@/lib/referral';

const ReferralRedirect = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      saveReferralCode(code);
    }
    navigate('/', { replace: true });
  }, [code, navigate]);

  return null;
};

export default ReferralRedirect;
