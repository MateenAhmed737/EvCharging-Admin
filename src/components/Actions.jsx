import { useState } from "react";
import { AiFillEye, AiFillFolderOpen } from "react-icons/ai";
import { FaFileVideo, FaFileImage } from "react-icons/fa6";
import { FaCalendarCheck, FaMegaport } from "react-icons/fa";
import { CgUnblock } from "react-icons/cg";
import { HiLockClosed } from "react-icons/hi";
import {
  MdBlock,
  MdDelete,
  MdFreeCancellation,
  MdModeEdit,
  MdNotificationAdd,
  MdReviews,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { token } from "../utils/url";

const Actions = ({
  id,
  data,
  setData,
  actionCols,
  setPaginatedData,
  setEditModal,
  setMediaModal,
  setViewModal,
  setImagesViewer,
  setVideosViewer,
  setPermissionsModal,
  setNotificationModal,
  blockUrl,
  deleteUrl,
  cancelUrl,
  hasEditAccess,
  hasDeleteAccess,
  hasPermissionsAccess,
  hasCancelBookingAccess,
}) => {
  const navigate = useNavigate();
  const [blockUser, setBlockUser] = useState(
    data?.status?.toLowerCase() === "inactive"
  );

  const remove = async () => {
    if (!hasDeleteAccess) return toast.error("You don't have access to delete!");

    try {
      const isFunction = typeof deleteUrl === "function";
      const formdata = new FormData();
      formdata.append("_id", data._id);
      console.log("_id", data._id);
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        headers,
        method: "POST",
        redirect: "follow",
        body: formdata,
      };
      const res = await fetch(
        ...(isFunction ? deleteUrl(data) : [deleteUrl, requestOptions])
      );
      const json = await res.json();
      console.log("json", json);

      if (json.status) {
        setData((prev) => prev.filter((e) => e._id !== data._id));
        setPaginatedData((prev) => ({
          ...prev,
          items: prev.items.filter((e) => e._id !== data._id),
        }));
        toast.success(json.message);
      } else if (!json.status) {
        toast.error(json.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlock = async () => {
    try {
      const isFunction = typeof blockUrl === "function";
      const requestOptions = {
        headers: {
          accept: "application/json",
        },
        method: "POST",
        redirect: "follow",
      };
      const res = await fetch(
        ...(isFunction ? blockUrl(data) : [`${blockUrl}/${id}`, requestOptions])
      );
      console.log("res status =======>", res.status);

      if (res.status === 200) {
        const mapCallback = (item) =>
          item.id == id
            ? {
                ...item,
                status:
                  item.status.toLowerCase() === "active"
                    ? "INACTIVE"
                    : "ACTIVE",
              }
            : item;

        setBlockUser(!blockUser);
        setData((prev) => prev.map(mapCallback));
        setPaginatedData((prev) => ({
          ...prev,
          items: prev.items.map(mapCallback),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cancelBooking = async () => {
    if (!hasCancelBookingAccess) return toast.error("You don't have access to cancel booking!");

    try {
      const formdata = new FormData();
      formdata.append("_id", data._id);
      console.log("_id", data._id);
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        headers,
        method: "POST",
        redirect: "follow",
        body: formdata,
      };
      const res = await fetch(cancelUrl, requestOptions);
      const json = await res.json();
      console.log("json", json);

      if (json.status) {
        const mapCallback = (e) =>
          e._id === data._id
            ? {
                ...e,
                status: "cancel",
              }
            : e;

        setData((prev) => prev.map(mapCallback));
        setPaginatedData((prev) => ({
          ...prev,
          items: prev.items.map(mapCallback),
        }));
        toast.success(json.message);
      } else if (!json.status) {
        toast.error(json.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkAction = (name) => {
    let element;

    if (name === "Cancel Booking") {
      const isCancelled = data.status === "cancel";
      element = (
        <td className="self-center px-6 py-2 pt-4 text-lg text-center">
          <button
            onClick={cancelBooking}
            className="font-medium text-gray-700 hover:text-gray-800 disabled:cursor-not-allowed disabled:hover:text-gray-500 disabled:text-gray-500"
            disabled={isCancelled}
            title={isCancelled ? "Already Cancelled" : "Cancel Booking"}
          >
            <MdFreeCancellation />
          </button>
        </td>
      );
    } else if (name === "Bookings") {
      element = (
        <td className="self-center px-6 py-2 pt-4 text-lg text-center">
          <button
            onClick={() => navigate(`/stations/${data._id}/bookings`)}
            className="font-medium text-gray-600 hover:text-gray-800"
          >
            <FaCalendarCheck />
          </button>
        </td>
      );
    } else if (name === "Reviews") {
      element = (
        <td className="self-center px-6 py-2 pt-4 text-lg text-center">
          <button
            onClick={() => navigate(`/stations/${data._id}/reviews`)}
            className="font-medium text-gray-600 hover:text-gray-800"
          >
            <MdReviews />
          </button>
        </td>
      );
    } else if (name === "Ports") {
      element = (
        <td className="self-center px-6 py-2 pt-4 text-lg text-center">
          <button
            onClick={() => navigate(`/stations/${data._id}/ports`)}
            className="font-medium text-gray-600 hover:text-gray-800"
          >
            <FaMegaport />
          </button>
        </td>
      );
    } else if (name === "View") {
      element = (
        <td className="self-center px-6 py-2 pt-4 text-lg text-center">
          <button
            onClick={() => setViewModal({ isOpen: true, data })}
            className="font-medium text-gray-600 hover:text-gray-800"
          >
            <AiFillEye />
          </button>
        </td>
      );
    } else if (name === "Images") {
      element = (
        <td className="self-center px-6 py-2 pt-4 text-lg text-center">
          <button
            onClick={() =>
              setImagesViewer({ isOpen: true, images: data._images })
            }
            className="font-medium text-gray-600 hover:text-gray-800"
          >
            <FaFileImage />
          </button>
        </td>
      );
    } else if (name === "Videos") {
      element = (
        <td className="self-center px-6 py-2 pt-4 text-lg text-center">
          <button
            onClick={() =>
              setVideosViewer({ isOpen: true, videos: data._videos })
            }
            className="font-medium text-gray-600 hover:text-gray-800"
          >
            <FaFileVideo />
          </button>
        </td>
      );
    } else if (name === "Media") {
      element = (
        <td className="self-center px-6 py-2 pt-4 text-lg text-center">
          <button
            onClick={() =>
              setMediaModal({
                isOpen: true,
                media: data._media || data._media_files,
              })
            }
            className="font-medium text-gray-600 hover:text-gray-800"
          >
            <AiFillFolderOpen />
          </button>
        </td>
      );
    } else if (name === "Permissions") {
      element = (
        <td className="self-center px-6 py-2 pt-4 text-lg text-center">
          <button
            onClick={() =>
              hasPermissionsAccess
                ? setPermissionsModal({
                    isOpen: true,
                    data,
                  })
                : toast.error("You don't have access to permissions!")
            }
            className="font-medium text-gray-600 hover:text-gray-800"
          >
            <HiLockClosed />
          </button>
        </td>
      );
    } else if (name === "Edit") {
      element = (
        <td className="self-center px-6 py-2 pt-4 text-lg text-center">
          <button
            onClick={() =>
              hasEditAccess
                ? setEditModal({ isOpen: true, data })
                : toast.error("You don't have access to edit!")
            }
            className="font-medium text-gray-600 hover:text-gray-800"
          >
            <MdModeEdit />
          </button>
        </td>
      );
    } else if (name === "Delete" || name === "Remove") {
      element = (
        <td className="self-center px-6 py-2 pt-4 text-lg text-center">
          <button
            onClick={remove}
            className="font-medium text-gray-600 hover:text-gray-800"
          >
            <MdDelete />
          </button>
        </td>
      );
    } else if (name === "Push Notification") {
      element = (
        <td className="self-center px-3 py-1 pt-3 text-xl text-center">
          <button
            className="font-medium text-gray-600 hover:text-gray-800"
            onClick={() => setNotificationModal({ isOpen: true, data })}
          >
            <MdNotificationAdd />
          </button>
        </td>
      );
    } else if (name === "Block/Unblock") {
      element = (
        <td className="self-center px-6 py-2 pt-4 text-lg text-center">
          <button
            onClick={handleBlock}
            className="font-medium text-red-600"
            title={blockUser ? "Unblock user" : "Block user"}
          >
            {blockUser ? <CgUnblock /> : <MdBlock />}
          </button>
        </td>
      );
    } else {
      element = <div>Action column not found!</div>;
    }

    return element;
  };

  return actionCols.map(checkAction);
};

export default Actions;
