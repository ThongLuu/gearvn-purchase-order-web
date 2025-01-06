import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { Card } from "primereact/card";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [user_name, setUserName] = useState("");
  const [user_email, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const roleOptions = [
    { label: "Manager", value: "manager" },
    { label: "Staff", value: "staff" },
  ];

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validateForm = () => {
    const newErrors = {};

    if (!user_name.trim()) {
      newErrors.user_name = "Username is required";
    }

    if (!validateEmail(user_email)) {
      newErrors.user_email = "Please enter a valid email address";
    }

    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!role) {
      newErrors.role = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await axios.post("/users/register", {
        user_name,
        user_email,
        password,
        role,
      });    
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Registration failed. Please try again." });
      }
    }
  };

  return (
    <div
      className="p-d-flex p-jc-center p-ai-center"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <Card
        className="p-shadow-5"
        style={{ width: "100%", maxWidth: "450px", padding: "2rem" }}
      >
        <h2 className="p-text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="user_name">Username</label>
              <span className="p-input-icon-left">
                <i className="pi pi-user" />
                <InputText
                  id="user_name"
                  value={user_name}
                  onChange={(e) => setUserName(e.target.value)}
                  className={errors.user_name ? "p-invalid" : ""}
                />
              </span>
              {errors.user_name && (
                <small className="p-error">{errors.user_name}</small>
              )}
            </div>
            <div className="p-field">
              <label htmlFor="user_email">Email</label>
              <span className="p-input-icon-left">
                <i className="pi pi-envelope" />
                <InputText
                  id="user_email"
                  type="email"
                  value={user_email}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className={errors.user_email ? "p-invalid" : ""}
                />
              </span>
              {errors.user_email && (
                <small className="p-error">{errors.user_email}</small>
              )}
            </div>
            <div className="p-field">
              <label htmlFor="password">Password</label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                toggleMask
                className={errors.password ? "p-invalid" : ""}
                promptLabel="Choose a password"
                weakLabel="Too simple"
                mediumLabel="Average complexity"
                strongLabel="Complex password"
              />
              {errors.password && (
                <small className="p-error">{errors.password}</small>
              )}
            </div>
            <div className="p-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <Password
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                feedback={false}
                toggleMask
                className={errors.confirmPassword ? "p-invalid" : ""}
              />
              {errors.confirmPassword && (
                <small className="p-error">{errors.confirmPassword}</small>
              )}
            </div>
            <div className="p-field">
              <label htmlFor="role">Role</label>
              <Dropdown
                id="role"
                value={role}
                options={roleOptions}
                onChange={(e) => setRole(e.value)}
                placeholder="Select a role"
                className={errors.role ? "p-invalid" : ""}
              />
              {errors.role && <small className="p-error">{errors.role}</small>}
            </div>
          </div>
          {errors.submit && (
            <Message severity="error" text={errors.submit} className="p-mb-2" />
          )}
          <Button
            type="submit"
            label="Register"
            className="p-mt-2 p-button-primary p-button-raised p-button-rounded"
          />
        </form>
        <div className="p-mt-3 p-text-center">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
