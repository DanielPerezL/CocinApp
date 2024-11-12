import { useTranslation } from "react-i18next";
import React, { useState } from "react";

interface RegisterMenuProps {
  onSubmit: (
    nickname: string,
    email: string,
    password: string
  ) => Promise<string>;
}

const RegisterMenu: React.FC<RegisterMenuProps> = ({ onSubmit }) => {
  const { t } = useTranslation();

  const [nickname, setNickname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [registerMsg, setRegisterMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRegisterMsg(null);

    try {
      const msg = await onSubmit(nickname, email, password);
      setRegisterMsg(msg);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setNickname("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="nickname" className="form-label">
          {t("nickname")}
        </label>
        <input
          type="text"
          className="form-control"
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          {t("email")}
        </label>
        <input
          type="email"
          className="form-control"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          {t("password")}
        </label>
        <input
          type="password"
          className="form-control"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={loading}
      >
        {loading ? t("loading...") : t("register")}
      </button>
      {registerMsg && <p className="alert alert-success mt-3">{registerMsg}</p>}
      {error && <p className="alert alert-danger mt-3">{error}</p>}
    </form>
  );
};

export default RegisterMenu;
