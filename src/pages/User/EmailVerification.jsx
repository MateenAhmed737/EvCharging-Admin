import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ConfirmationCodeFeilds, Loader, Page } from "../../components";
import { useContext } from "react";
import { AppContext } from "../../context";
import { base_url, token } from "../../utils/url";
import toast from "react-hot-toast";

const EmailVerification = () => {
  const navigate = useNavigate();
  const { otpData, setOtpData } = useContext(AppContext);
  const [state, setState] = useState(null);
  const [counter, setCounter] = useState(600);
  const [toggleBtn, setToggleBtn] = useState(false);

  const minutes = Math.floor(counter / 60);
  const seconds = counter % 60;

  console.log("otpData", otpData);
  const onChange = (val) => {
    setState(val);
  };

  const handleResend = async () => {
    setToggleBtn(true);
    let json;

    try {
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);

      const formdata = new FormData();
      formdata.append("email", otpData?.email);

      const requestOptions = {
        headers,
        method: "POST",
        body: formdata,
        redirect: "follow",
      };

      const res = await fetch(`${base_url}/admin/verify_email`, requestOptions);
      json = await res.json();
      console.log("json", json);

      if (json.status) {
        const data = json.data;
        setOtpData({ email: otpData.email, ...data });

        navigate("/email-verification");
      } else {
        toast.error(
          json?.message.toLowerCase().includes("not found")
            ? "Email not found!"
            : json?.message,
          { duration: 1500 }
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggleBtn(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setToggleBtn(true);

    if (otpData.OTP == state) {
      toast.success("Email verification completed!", { duration: 2000 });
      setTimeout(() => {
        navigate("/change-password");
      }, 2000);
    } else {
      setToggleBtn(false);
      toast.error("OTP doesn't match! Please try again.", { duration: 1500 });
    }
  };

  const config = {
    fields: 4,
    type: "number",
    autoFocus: true,
    onChange,
  };

  useEffect(() => {
    const timer =
      counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue =
        "Are you sure you want to leave? You'll need to verify your email again";
    };

    document.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.addEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return otpData === null ? (
    <Navigate to={"/login"} />
  ) : (
    <Page title="Email Verification" extraClasses="pt-10 h-screen">
      <main className="flex justify-center w-full h-full p-3 font-poppins">
        <div className="w-full max-w-md p-4">
          <h2 className="mb-2 text-lg font-semibold">Email Verification</h2>

          <p className="mb-3 text-xs">
            We have sent one-time password to{" "}
            <span className="font-semibold">{otpData.email}</span>
          </p>

          <form onSubmit={handleSubmit}>
            <p className="flex justify-between text-xs">
              OTP
              <span className="font-semibold">{`${
                minutes < 10 ? "0" + minutes : minutes
              } : ${seconds < 10 ? "0" + seconds : seconds}`}</span>
            </p>

            <ConfirmationCodeFeilds {...config} />

            {counter === 0 && (
              <button
                onClick={handleResend}
                className="block mx-auto text-[11px] mt-2 text-primary-500 hover:underline font-medium text-center"
              >
                Resend
              </button>
            )}

            <button
              type="submit"
              id="continue"
              className="flex items-center justify-center w-full px-5 py-3 mt-3.5 text-xs font-medium text-center text-white bg-primary-500 rounded-lg hover:bg-primary-600 focus:ring-4 focus:outline-none focus:ring-primary-100 disabled:bg-primary-300 disabled:saturate-30 disabled:py-1 disabled:cursor-not-allowed"
              disabled={toggleBtn}
            >
              {toggleBtn && (
                <Loader
                  extraStyles="!static !inset-auto !block !scale-50 !bg-transparent !saturate-100"
                  loaderColor={toggleBtn ? "fill-primary-300" : ""}
                />
              )}
              Continue
            </button>
          </form>
        </div>
      </main>
    </Page>
  );
};

export default EmailVerification;
