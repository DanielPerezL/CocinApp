import React, { useEffect, useRef, useState } from "react";
import AuthWrapper from "../components/AuthWrapper";
import {
  RECIPE_LIMIT,
  fetchLoggedUserProfile,
  fetchUserRecipes,
  isLoggedIn,
} from "../services/apiService";
import { RecipeSimpleDTO, UserDTO } from "../interfaces";
import RecipeGrid from "../components/RecipeGrid";
import UserDetails from "../components/UserDetails";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Spinner } from "react-bootstrap";

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();

  const [user, setUser] = useState<UserDTO | null>(null);
  const [recipes, setRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const loadingRef = useRef<boolean>(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadMyRecipes = async (user_id: string) => {
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
    const getUserProfile = async () => {
      try {
        const userProfile = await fetchLoggedUserProfile();
        setUser(userProfile);
        loadMyRecipes(userProfile.id);
      } catch (error) {
        window.location.reload();
      }
    };

    if (!isLoggedIn()) return;
    getUserProfile();
  }, [refresh]);

  return (
    <AuthWrapper
      onLoginSuccess={() => {
        setRefresh(!refresh);
      }}
    >
      <div className="main-container container">
        {user ? (
          <>
            <UserDetails user={user} />

            {recipes && (
              <div className="container mt-5">
                <div className="text-center mt4 mb-2">
                  {loadingRef.current && (
                    <div className="mt-5 spinner-container">
                      <Spinner
                        animation="grow"
                        variant="primary"
                        role="status"
                      />
                    </div>
                  )}
                  {error && <p className="text-danger">{error}</p>}
                  {!loadingRef.current && !error ? (
                    recipes.length > 0 ? (
                      <p className="fs-6 fw-light mt-4 mb-3">
                        {t("hereYourRecipes")}
                      </p>
                    ) : (
                      <>
                        <p className="fs-6 fw-light mt-4 mb-3">
                          {t("noYourRecipes")}
                        </p>
                        <Link
                          to="/publish"
                          onClick={() => {
                            window.scroll(0, 0);
                          }}
                        >
                          <button className="btn btn-secondary">
                            {t("startPublishing")}
                          </button>
                        </Link>
                      </>
                    )
                  ) : null}
                  {!loadingRef.current && !error && (
                    <RecipeGrid
                      hasMore={hasMore}
                      loading={loadingRef.current}
                      onLoadMore={() => {
                        loadMyRecipes(user.id);
                      }}
                      recipes={recipes}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <p>{t("loadingUserProfile")}</p>
        )}
      </div>
    </AuthWrapper>
  );
};

export default ProfilePage;
