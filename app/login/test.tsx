import React, { useEffect, useState } from 'react';

type Icon = {
  id: number;
  name: string;
  icon: string;
};

export default function IconList() {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchIcons() {
      try {
        const response = await fetch('/api/icons');
        const data: Icon[] = await response.json();
        setIcons(data);
      } catch (error) {
        console.error('Error fetching icons:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchIcons();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (icons.length === 0) {
	return <></>;
  }

  return (
    <div>
      <h1>Icons</h1>
      <ul>
        {icons.map((icon) => (
          <li key={icon.id}>{icon.name} - {icon.icon}</li>
        ))}
      </ul>
    </div>
  );
}
