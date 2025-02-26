"use client";

import { useState, useEffect } from "react";
import { searchUsers } from "@/lib/userService";

const SearchUsers = ({
  onSelectUser,
}: {
  onSelectUser: (user: any) => void;
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (query.length > 0) {
      const fetchUsers = async () => {
        const users = await searchUsers(query);
        setResults(users);
      };
      fetchUsers();
    } else {
      setResults([]);
    }
  }, [query]); // 🔥 Query change hote hi search trigger hoga

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Users..."
        className="border p-2 w-full"
      />
      <ul>
        {results.map((user) => (
          <li
            key={user.id}
            onClick={() => onSelectUser(user)}
            className="cursor-pointer p-2 hover:bg-gray-200"
          >
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchUsers;
