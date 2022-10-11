<template>
  <div class="left-form" ref="form">
    <el-form :inline="true" size="mini" label-width="90px" label-position="left">
      <el-form-item label="年龄：">
        <el-input-number
          v-model="formData.age"
          @change="onChangeAge"
          :min="1"
          :max="100"
          placeholder="年龄"
        />
      </el-form-item>
      <el-form-item label="出生日期：">
        <el-date-picker
          v-model="formData.birthday"
          @change="onChangeBirthday"
          type="date"
          placeholder="出生日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="性别：">
        <el-radio v-model="formData.sex" label="1">男</el-radio>
        <el-radio v-model="formData.sex" label="0">女</el-radio>
      </el-form-item>
      <el-form-item label="地区代码：">
        <el-input v-model="formData.areaCode" placeholder="地区代码" />
        <el-cascader
          ref="areaCodeRef"
          v-model="formData.areaCode"
          :options="areaOptions"
          :props="areaPropsOption"
          :show-all-levels="true"
          @change="onChangeAreaCode"
          placeholder="地区代码"
          clearable
          filterable
        />
      </el-form-item>
      <el-form-item label="生成个数：">
        <el-input-number v-model="formData.number" :min="1" :max="100" placeholder="生成个数" />
      </el-form-item>
      <el-form-item label="关系：">
        <el-select v-model="formData.relation" placeholder="关系">
          <el-option
            v-for="item in relationOptions"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">生成</el-button>
        <el-button type="primary" @click="onSubmitWithFamily">我&妻&女&子</el-button>
        <el-button type="primary" @click="onSubmitWithParent">我&父母</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmitWithBigFamily">四世同堂(8人)</el-button>
      </el-form-item>
    </el-form>
  </div>
  <div class="content">
    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column align="center" prop="relation" label="关系" width="60" />
      <el-table-column align="center" prop="name" label="名字" width="80">
        <template #default="scope">
          <span @click="handleClickCopy(scope.row.name)">{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="idCard" label="身份证号码" width="165">
        <template #default="scope">
          <span @click="handleClickCopy(scope.row.idCard)">{{scope.row.idCard}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="mobile" label="手机号" width="120">
        <template #default="scope">
          <span @click="handleClickCopy(scope.row.mobile)">{{scope.row.mobile}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="sex" label="性别" width="60" />
      <el-table-column align="center" prop="birthday" label="出生日期" width="120">
        <template #default="scope">
          <span @click="handleClickCopy(scope.row.birthday)">{{scope.row.birthday}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="age" label="年龄" width="50" />
      <el-table-column align="center" prop="address" label="地址">
        <template #default="scope">
          <span @click="handleClickCopy(scope.row.address)">{{scope.row.address}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="140">
        <template #default="scope">
          <el-button
            type="text"
            size="small"
            @click="handleGenerateImage(scope.row.name, scope.row.idCard, scope.row.sex, scope.row.address)"
          >生成照片</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import IdcardConstant from '@/constant/idcard'
import { IdCardInfo, IdCardInput } from 'idCard'
import { generateIdCardInfo, getAge, getBirthday } from '@/utils/IdCardUtils'
import { defineComponent, onMounted, reactive } from 'vue'
import { RelationContext } from '@/service/idcard/RelationStrategy'
import { useRouter } from 'vue-router'
import useClipboard from 'vue-clipboard3'
import { ElMessage } from 'element-plus'

export default defineComponent({
  setup() {
    const router = useRouter()
    const clipboard = useClipboard()

    const formData = reactive<IdCardInput>({
      age: 20,
      sex: '1',
      areaCode: '110101',
      birthday: getBirthday(20),
      number: 5,
      relation: '0',
      address: ''
    })

    const areaOptions = IdcardConstant.cities
    const areaPropsOption = {
      value: 'code',
      label: 'name',
      children: 'child'
    }
    const relationOptions = IdcardConstant.relationData
    const tableData = reactive<IdCardInfo[]>([])

    const onChangeAge = (value: number): void => {
      formData.birthday = getBirthday(value)
    }

    const onChangeBirthday = (payload: Event): void => {
      formData.age = getAge(payload as unknown as string)
    }

    const onChangeAreaCode = (value: Array<string>): void => {
      const lastValue = value?.pop()
      formData.areaCode = lastValue || '110101'
    }

    const onSubmit = (): void => {
      tableData.length = 0
      if (formData.relation === '0') {
        let count = 0
        while (count < formData.number) {
          tableData.push(generateIdCardInfo(formData))
          count++
        }
      } else {
        const oneSelfParams: IdCardInput = {
          age: formData.age,
          sex: formData.sex,
          areaCode: formData.areaCode,
          birthday: formData.birthday,
          number: formData.number,
          relation: '0',
          address: ''
        }
        // 生成自己
        tableData.push(generateIdCardInfo(oneSelfParams))
        let count = 0
        while (count < formData.number) {
          const params: IdCardInput = {
            age: formData.age,
            sex: formData.sex,
            areaCode: formData.areaCode,
            birthday: formData.birthday,
            number: formData.number,
            relation: formData.relation,
            address: ''
          }
          const relationContext = new RelationContext(params)
          const newParams = relationContext.execute()
          tableData.push(generateIdCardInfo(newParams))
          count++
        }
      }
    }

    const onSubmitWithFamily = (): void => {
      const array: Array<string> = ['0', '1', '2', '3']
      generateIdCardInfos(array)
    }

    const onSubmitWithParent = (): void => {
      const array: Array<string> = ['0', '4', '5']
      generateIdCardInfos(array)
    }

    const onSubmitWithBigFamily = (): void => {
      const array: Array<string> = ['0', '1', '4', '5', '2', '3', '8', '9']
      generateIdCardInfos(array)
    }

    const generateIdCardInfos = (array: Array<string>): void => {
      tableData.length = 0
      const params: IdCardInput = {
        age: formData.age,
        sex: formData.sex,
        areaCode: formData.areaCode,
        birthday: formData.birthday,
        number: formData.number,
        relation: '0',
        address: ''
      }
      array.forEach(element => {
        params.relation = element
        // 生成自己
        const relationContext = new RelationContext(params)
        const newParams = relationContext.execute()
        tableData.push(generateIdCardInfo(newParams))
      })
    }

    const handleGenerateImage = (_name: string, _idCard: string, _sexText: string, _address: string): void => {
      router.push({
        name: 'IdCardImage',
        params: {
          name: _name,
          idCard: _idCard,
          sexText: _sexText,
          address: _address
        }
      })
    }

    const handleClickCopy = async (value: string): Promise<void> => {
      await clipboard.toClipboard(value)
      ElMessage('已复制')
    }

    onMounted(() => {
      onSubmit()
    })

    return {
      areaOptions,
      areaPropsOption,
      relationOptions,
      formData,
      tableData,
      onChangeAge,
      onChangeBirthday,
      onChangeAreaCode,
      onSubmit,
      onSubmitWithFamily,
      onSubmitWithParent,
      onSubmitWithBigFamily,
      handleGenerateImage,
      handleClickCopy
    }
  }
})

</script>

<style lang="less" scoped>
.left-form {
  float: left;
  width: 320px;
  height: 100%;
  padding: 20px;
  box-shadow: var(--el-box-shadow-light);
}
.content {
  margin-left: 380px;
  padding: 20px;
  box-shadow: var(--el-box-shadow-light);
}
.el-button {
  width: 95px;
  margin-bottom: 10px;
}
</style>
