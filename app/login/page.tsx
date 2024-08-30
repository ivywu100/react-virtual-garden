'use client'

import { useEffect, useState } from "react";

const LoginPage = () => {

  const [testString, setTestString] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchTestString() {
      try {
        const response = await fetch('/api/test');
        const data: string = await response.json();
        setTestString(data);
      } catch (error) {
        console.error('Error fetching test string:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTestString();
  }, []);
  
  return (<>
      <div> {`This is the login page, but it's still in development...`}
      </div>
      <div>{loading ? `loading...` : testString}</div>
      {/* <IconList/> */}
    </>
  );
}

export default LoginPage;