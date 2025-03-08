import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchUserPublicFromNick,
  fetchUserRecipes,
} from "../services/apiService";
import { UserPublicDTO, RecipeSimpleDTO } from "../interfaces";
import RecipeGrid from "../components/RecipeGrid";
import { t } from "i18next";
import UserPublicDetails from "../components/UserPublicDetails";
import NoPage from "./NoPage";
import { Spinner } from "react-bootstrap";

const UserPage: React.FC = () => {
  const { nickname } = useParams<{ nickname: string }>();
  const [user, setUser] = useState<UserPublicDTO | null>(null);
  const [recipes, setRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadingRef = useRef<boolean>(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadRecipes = async (user_id: string) => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    try {
      const data = await fetchUserRecipes(user_id, offset);
      const newRecipes = data.recipes;

      setRecipes((prev) => [...prev, ...newRecipes]);
      setOffset((prev) => prev + newRecipes.length);
      setHasMore(data.has_more);
    } catch (err: any) {
      setError(err.message);
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (!nickname) {
        setError(t("errorInvalidUser"));
        return;
      }

      try {
        const userData = await fetchUserPublicFromNick(nickname);
        setUser(userData);
        loadRecipes(userData.id);
      } catch (err) {
        setError(t("errorUserNotFound"));
      }
    };

    loadUserData();
  }, [nickname]);

  if (error) return <NoPage />;

  return (
    <main className="container main-container">
      {user ? (
        <>
          <UserPublicDetails user={user} />
          {!loadingRef.current && recipes ? (
            <div className="container mt-4">
              <div className="text-center mb-2">
                {recipes.length > 0 ? (
                  <p className="fs-6 fw-light mt-4 mb-3">{t("theirRecipes")}</p>
                ) : (
                  <p className="fs-6 fw-light mt-4 mb-3">
                    {t("noTheirRecipes")}
                  </p>
                )}
                {error && <p className="text-danger">{error}</p>}
                {!error && (
                  <RecipeGrid
                    hasMore={hasMore}
                    loading={loadingRef.current}
                    onLoadMore={() => {
                      loadRecipes(user.id);
                    }}
                    recipes={recipes}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="spinner-container">
              <Spinner animation="grow" variant="primary" role="status" />
            </div>
          )}
        </>
      ) : (
        <div className="spinner-container">
          <Spinner animation="grow" variant="primary" role="status" />
        </div>
      )}
    </main>
  );
};

export default UserPage;
