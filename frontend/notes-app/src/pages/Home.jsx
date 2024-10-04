import React, { useEffect, useState } from 'react'
import { Navbar } from '../components/Navbar'
import { NoteCard } from '../components/NoteCard'
import { MdAdd } from 'react-icons/md'
import { AddEditNotes } from './AddEditNotes'
import Modal from "react-modal";
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import { ToastMessage } from '../components/ToastMessage'
import { EmptyCard } from '../components/EmptyCard'



export const Home = () => {

  const [openAddEditModal,setOpenAddEditModal] = useState({
    isShow: false,
    type: "add",
    data: null,
  });

  const [showToastMsg, setshowToastMsg] = useState({
      isShow: false,
      message: "",
      type: "add",
  });

  const [userInfo,setUserInfo] = useState(null);
  const [allnotes,setAllNotes] = useState([]);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({isShow: true, data: noteDetails, type: "edit"});
  }

  const showToastMessage = (message, type)=> {
    setshowToastMsg({
      isShow: true,
      message,
      type,
    })
  }
 
  const handleCloseToast = ()=> {
    setshowToastMsg({
      isShow: false,
      message: "",
    })
  }
 
  //Get the user info
  const getUserInfo = async ()=> {
    try {
      const response = await axiosInstance.get("/get-user");
      if(response.data && response.data.user) {
          setUserInfo(response.data.user);
      }
    }catch(err) {
        if(err.response.status === 401){
          localStorage.clear();
          navigate("/login")
        }
     }
  }

  //Get all notes
  const getAllNotes = async ()=> {
    try {
      const response = await axiosInstance.get("/get-all");
      if(response.data && response.data.notes) {
        setAllNotes(response.data.notes)
      }
    }catch(err) {
      console.log("An Unexpected error occured. Please try again!")
    }
  }

  //Delete Notes
  const deleteNote = async(data) => {
    const noteId = data._id
    try {
      const response = await axiosInstance.delete("/delete-note" + noteId);
      if (response.data && !response.data.err){
        showToastMessage("Note Deleted Succss", 'delete');
        getAllNotes();
      
      }
    }catch (err) {
      if( err.response && err.response.data && err.response.data.message){
        console.log("An Unexpected error occured. Please try again!")
      }
    }
  }

  useEffect(()=> {
      getAllNotes();
      getUserInfo();
      return ()=> {};
  }, [])

  return (
    <>
      <Navbar userInfo = {userInfo} />
      <div className='container mx-auto'>
       { allnotes.length > 0 ? <div className='grid grid-cols-3 gap-4 mt-8'>
          {allnotes.map((item, index) => (
              <NoteCard 
              key={item._id}
              title= {item.title}
              date= {item.createdOn}
              content= {item.content}
              tags= {item.tags}
              isPinned= {item.isPinned}
              onEdit={()=>{handleEdit(item);}}
              onDelete={()=> deleteNote(item)}
              onPinNote={()=> {}} />
          ))}
        
        </div> : <EmptyCard  />}
      </div>
      <button className='w-16 h-16 flex itmes-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10' onClick={()=> {
        setOpenAddEditModal({
          isShow: true,
          type: "add",
          data: null
        })
      }}>
        <MdAdd className="text-[32px] text-white self-center"/>
      </button>
      <Modal 
          isOpen= {openAddEditModal.isShow}
          onRequestClose= {()=> {}}
          style = {{
            overlay: {
              backgroundColor: "rgba(0,0,0,0,2)",
            }
          }}
          contentLabel=""
          className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll" >

        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={()=> {
          setOpenAddEditModal({
            isShow: false,
            type: "add",
            data:null
          })
        }} 
          getAllNotes= {getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>
      <ToastMessage
        isShow= {showToastMsg.isShow}
        message = {showToastMsg.message}
        type = {showToastMsg.type}
        onClose={handleCloseToast}

      />
    </>
  )
}
